<script lang="ts">
	import { onMount } from 'svelte';
	import { Camera, Mesh, Program, Renderer, Transform, Triangle } from 'ogl';

	type Props = { pattern: string; label?: string };
	let { pattern, label }: Props = $props();
	let host: HTMLDivElement;

	function getFragmentShader(pat: string): string {
		const clean = pat.replace(/^bits-/, '');

		if (['dithered-image', 'pixelated-image', 'ascii-renderer', 'dither', 'pixel-blast', 'grid-scan'].includes(clean)) {
			return `precision highp float;
				varying vec2 vUv;
				uniform float uTime;
				uniform float uHue;
				void main(){
					vec2 grid = floor(vUv * 32.0) / 32.0;
					float pat = sin((grid.x + uTime * 0.1) * 18.0) * cos((grid.y - uTime * 0.08) * 18.0);
					float val = step(0.0, pat);
					vec3 col = mix(vec3(0.04, 0.07, 0.14), vec3(0.15, 0.75, 0.65), val);
					gl_FragColor = vec4(col, 1.0);
				}`;
		}

		if (['neural-noise', 'aurora', 'plasma-grid', 'god-rays', 'halo', 'lava-lamp', 'light-rays', 'beams'].includes(clean)) {
			return `precision highp float;
				varying vec2 vUv;
				uniform float uTime;
				uniform float uHue;
				void main(){
					vec2 uv = vUv - 0.5;
					float d = length(uv);
					float angle = atan(uv.y, uv.x);
					float ray = sin(angle * 8.0 + uTime * 1.2) * 0.5 + 0.5;
					float glow = smoothstep(0.55, 0.0, d) * ray;
					vec3 color = 0.5 + 0.5 * cos(uTime * 0.5 + uv.xyx + vec3(0.0, 2.0, 4.0));
					gl_FragColor = vec4(color * glow, 1.0);
				}`;
		}

		if (['fluid-simulation', 'water-ripple', 'liquid-metal', 'fluid-image-reveal', 'liquid-chrome', 'waves'].includes(clean)) {
			return `precision highp float;
				varying vec2 vUv;
				uniform float uTime;
				uniform float uHue;
				void main(){
					vec2 uv = vUv;
					uv.x += sin(uv.y * 10.0 + uTime * 1.8) * 0.025;
					uv.y += cos(uv.x * 10.0 + uTime * 1.4) * 0.025;
					float val = sin(uv.x * 14.0) * cos(uv.y * 14.0);
					vec3 col = mix(vec3(0.08, 0.16, 0.4), vec3(0.85, 0.35, 0.75), val * 0.5 + 0.5);
					gl_FragColor = vec4(col, 1.0);
				}`;
		}

		if (['card-3d', 'rubiks-cube', 'globe', 'prism', 'card-swap'].includes(clean)) {
			return `precision highp float;
				varying vec2 vUv;
				uniform float uTime;
				uniform float uHue;
				void main(){
					vec2 uv = vUv - 0.5;
					float dist = max(abs(uv.x), abs(uv.y));
					float edge = smoothstep(0.44, 0.42, dist);
					float grid = sin(uv.x * 36.0 + uTime) * sin(uv.y * 36.0 + uTime);
					vec3 col = mix(vec3(0.02, 0.03, 0.06), vec3(0.25, 0.55, 0.95), edge * (grid > 0.0 ? 0.85 : 0.35));
					gl_FragColor = vec4(col, 1.0);
				}`;
		}

		// Default wave shader
		return `precision highp float;
			varying vec2 vUv;
			uniform float uTime;
			uniform float uHue;
			void main(){
				vec2 uv = vUv - 0.5;
				float wave = sin((uv.x + uTime * 0.08) * 12.0 + sin(uv.y * 9.0 - uTime * 0.12) * 2.0);
				float glow = 0.35 + 0.32 * wave + 0.18 * sin(length(uv) * 18.0 - uTime);
				vec3 base = 0.5 + 0.5 * cos(6.28318 * (uHue / 360.0 + vec3(0.0, 0.33, 0.67) + glow));
				gl_FragColor = vec4(base * (0.55 + 0.45 * smoothstep(0.8, 0.05, length(uv))), 1.0);
			}`;
	}

	onMount(() => {
		if (!host) return;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let renderer: Renderer | null = null;
		let frame = 0;

		try {
			renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) });
			const gl = renderer.gl;
			const camera = new Camera(gl);
			camera.position.z = 1;
			const scene = new Transform();
			const hues = Array.from(pattern).reduce((total, character) => total + character.charCodeAt(0), 0) % 360;

			const program = new Program(gl, {
				vertex: `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`,
				fragment: getFragmentShader(pattern),
				uniforms: { uTime: { value: 0 }, uHue: { value: hues } }
			});

			const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
			mesh.setParent(scene);
			host.appendChild(gl.canvas);

			const resize = () => {
				if (!host || !renderer) return;
				const { width, height } = host.getBoundingClientRect();
				if (width > 0 && height > 0) {
					renderer.setSize(width, height);
					camera.perspective({ fov: 45, aspect: width / height });
				}
			};

			const observer = new ResizeObserver(resize);
			observer.observe(host);
			resize();

			const render = (time: number) => {
				if (!renderer) return;
				program.uniforms.uTime.value = time * 0.001;
				renderer.render({ scene, camera });
				if (!reducedMotion) frame = requestAnimationFrame(render);
			};
			render(0);

			return () => {
				cancelAnimationFrame(frame);
				observer.disconnect();
				if (gl.canvas && gl.canvas.parentNode) {
					gl.canvas.parentNode.removeChild(gl.canvas);
				}
				gl.getExtension('WEBGL_lose_context')?.loseContext();
			};
		} catch {
			return () => {};
		}
	});
</script>

<div bind:this={host} class="canvas-motion" data-pattern={pattern} role="img" aria-label={label ?? `${pattern.replaceAll('-', ' ')} animated canvas`}></div>

