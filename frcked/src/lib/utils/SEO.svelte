<script lang="ts">
	import { APP_NAME } from '$lib/utils';

	interface SEOProps {
		title?: string;
		description?: string;
		keywords?: string;
		author?: string;
		url?: string;
		image?: string;
		imageAlt?: string;
		type?: string;
		siteName?: string;
		locale?: string;
		twitterHandle?: string;
		canonicalUrl?: string;
		noindex?: boolean;
		nofollow?: boolean;
		themeColor?: string;
		applicationName?: string;
		appleTitle?: string;
		manifestPath?: string;
		faviconPath?: string;
		appleTouchIconPath?: string;
		ogImageWidth?: number;
		ogImageHeight?: number;
		structuredData?: object | null;
		additionalMeta?: Array<{
			name?: string;
			property?: string;
			content: string;
		}>;
	}

	let {
		title = `${APP_NAME} - svelte gui`,
		description = `${APP_NAME} is a modern svelte gui. Fast, secure, and scalable.`,
		keywords = 'svelte, gui, modern, secure, fast, scalable',
		author = `${APP_NAME} Team`,
		url = 'https://localhost:5173',
		image = '/images/og-image.png',
		imageAlt = `${APP_NAME} - svelte gui`,
		type = 'website',
		siteName = APP_NAME,
		locale = 'en_US',
		twitterHandle = '',
		canonicalUrl = '',
		noindex = false,
		nofollow = false,
		themeColor = '#1f2937',
		applicationName = APP_NAME,
		appleTitle = APP_NAME,
		manifestPath = '/manifest.json',
		faviconPath = '/favicon.png',
		appleTouchIconPath = '/favicon.png',
		ogImageWidth = 1200,
		ogImageHeight = 630,
		structuredData = null,
		additionalMeta = []
	}: SEOProps = $props();

	const fullImageUrl = $derived(image.startsWith('http') ? image : `${url}${image}`);
	const fullCanonicalUrl = $derived(canonicalUrl || url);
	const fullManifestUrl = $derived(manifestPath.startsWith('http') ? manifestPath : manifestPath);

	const robotsContent = $derived(
		[noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'].join(', ')
	);

	const defaultStructuredData = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteName,
		url: url,
		description: description,
		author: {
			'@type': 'Organization',
			name: author
		},
		image: {
			'@type': 'ImageObject',
			url: fullImageUrl,
			width: ogImageWidth,
			height: ogImageHeight
		}
	});

	const finalStructuredData = $derived(structuredData || defaultStructuredData);

	function createStructuredDataScript() {
		if (!finalStructuredData) return '';
		const jsonString = JSON.stringify(finalStructuredData);
		return '<script type="application/ld+json">' + jsonString + '<' + '/script>';
	}
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content={author} />
	<meta name="robots" content={robotsContent} />

	<!-- Canonical URL -->
	<link rel="canonical" href={fullCanonicalUrl} />

	<!-- Favicon and Icons -->
	<link rel="icon" href={faviconPath} />
	<link rel="apple-touch-icon" href={appleTouchIconPath} />

	<!-- PWA and Mobile -->
	<link rel="manifest" href={fullManifestUrl} />
	<meta name="theme-color" content={themeColor} />
	<meta name="msapplication-TileColor" content={themeColor} />
	<meta name="application-name" content={applicationName} />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<meta name="apple-mobile-web-app-title" content={appleTitle} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta property="og:image:width" content={ogImageWidth.toString()} />
	<meta property="og:image:height" content={ogImageHeight.toString()} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={locale} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={url} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={fullImageUrl} />
	<meta property="twitter:image:alt" content={imageAlt} />
	{#if twitterHandle}
		<meta property="twitter:site" content={twitterHandle} />
		<meta property="twitter:creator" content={twitterHandle} />
	{/if}

	<!-- Additional Custom Meta Tags -->
	{#each additionalMeta as meta, index (index)}
		{#if meta.name}
			<meta name={meta.name} content={meta.content} />
		{:else if meta.property}
			<meta property={meta.property} content={meta.content} />
		{/if}
	{/each}

	<!-- JSON-LD Structured Data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html createStructuredDataScript()}
</svelte:head>
