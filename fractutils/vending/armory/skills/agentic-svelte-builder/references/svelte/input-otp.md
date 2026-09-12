# Svelte 5 Native Input OTP

An accessible single-digit OTP input component powered by **Svelte 5 Runes** (`$state`, `$derived`, `$props`). Features auto-advancing focus on input, backspace traversal, and multi-digit clipboard paste handling.

---

## Component Implementation (`InputOtp.svelte`)

```svelte
<script lang="ts">
  type Props = {
    length?: number;
    value?: string;
    oncomplete?: (code: string) => void;
  };

  let { length = 6, value = $bindable(''), oncomplete }: Props = $props();

  let digits = $state<string[]>(Array(length).fill(''));
  let inputs = $state<HTMLInputElement[]>([]);

  function updateValue() {
    value = digits.join('');
    if (value.length === length && !digits.includes('')) {
      oncomplete?.(value);
    }
  }

  function handleInput(e: Event, index: number) {
    const input = e.target as HTMLInputElement;
    const val = input.value.slice(-1);
    digits[index] = val;
    updateValue();

    if (val && index < length - 1) {
      inputs[index + 1]?.focus();
    }
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text').trim().slice(0, length) || '';
    pasted.split('').forEach((char, i) => {
      if (i < length) digits[i] = char;
    });
    updateValue();
    inputs[Math.min(pasted.length, length - 1)]?.focus();
  }
</script>

<div class="[ input-otp ] [ row ycenter gap8 ]">
  {#each Array(length) as _, i}
    <input
      bind:this={inputs[i]}
      type="text"
      inputmode="numeric"
      maxlength="1"
      value={digits[i]}
      oninput={(e) => handleInput(e, i)}
      onkeydown={(e) => handleKeydown(e, i)}
      onpaste={handlePaste}
      class="[ input-otp__box ] [ width40 height48 text-center text-lg bold radius6 bdr ]"
    />
  {/each}
</div>

```

### External stylesheet (`input-otp.sass`)

```sass
	.input-otp__box
		color: var(--foreground10)
		background-color: var(--background10)
		border-color: var(--border)
		&:focus
			outline: none
			border-color: var(--brand-primary)
			box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import InputOtp from './InputOtp.svelte';

  let otpCode = $state('');

  function handleComplete(code: string) {
    console.log('OTP Code Entered:', code);
  }
</script>

<InputOtp length={6} bind:value={otpCode} oncomplete={handleComplete} />
<p>Code: {otpCode}</p>
```
