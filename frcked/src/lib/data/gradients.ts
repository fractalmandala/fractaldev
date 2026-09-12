export interface GradientPreset {
	id: string;
	name: string;
	colors: string[];
	css: string;
	dark?: boolean;
}

function getHexLuminance(hex: string): number {
	const clean = hex.replace('#', '').trim();
	if (clean.length < 6) return 0.5;
	const r = parseInt(clean.substring(0, 2), 16);
	const g = parseInt(clean.substring(2, 4), 16);
	const b = parseInt(clean.substring(4, 6), 16);
	if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isGradientDark(g: GradientPreset): boolean {
	if (g.dark !== undefined) return g.dark;
	if (!g.colors || !g.colors.length) return false;
	const avgLum = g.colors.reduce((sum, c) => sum + getHexLuminance(c), 0) / g.colors.length;
	return avgLum < 0.5;
}


export const GRADIENT_PRESETS: GradientPreset[] = [
	{
		"id": "omolon",
		"name": "Omolon",
		"colors": [
			"#091E3A",
			"#2F80ED",
			"#2D9EE0"
		],
		"css": "linear-gradient(135deg, #091E3A, #2F80ED, #2D9EE0)"
	},
	{
		"id": "farhan",
		"name": "Farhan",
		"colors": [
			"#9400D3",
			"#4B0082"
		],
		"css": "linear-gradient(135deg, #9400D3, #4B0082)"
	},
	{
		"id": "purple",
		"name": "Purple",
		"colors": [
			"#c84e89",
			"#F15F79"
		],
		"css": "linear-gradient(135deg, #c84e89, #F15F79)"
	},
	{
		"id": "ibtesam",
		"name": "Ibtesam",
		"colors": [
			"#00F5A0",
			"#00D9F5"
		],
		"css": "linear-gradient(135deg, #00F5A0, #00D9F5)"
	},
	{
		"id": "radioactive-heat",
		"name": "Radioactive Heat",
		"colors": [
			"#F7941E",
			"#72C6EF",
			"#00A651"
		],
		"css": "linear-gradient(135deg, #F7941E, #72C6EF, #00A651)"
	},
	{
		"id": "the-sky-and-the-sea",
		"name": "The Sky And The Sea",
		"colors": [
			"#F7941E",
			"#004E8F"
		],
		"css": "linear-gradient(135deg, #F7941E, #004E8F)"
	},
	{
		"id": "from-ice-to-fire",
		"name": "From Ice To Fire",
		"colors": [
			"#72C6EF",
			"#004E8F"
		],
		"css": "linear-gradient(135deg, #72C6EF, #004E8F)"
	},
	{
		"id": "blue-orange",
		"name": "Blue & Orange",
		"colors": [
			"#FD8112",
			"#0085CA"
		],
		"css": "linear-gradient(135deg, #FD8112, #0085CA)"
	},
	{
		"id": "purple-dream",
		"name": "Purple Dream",
		"colors": [
			"#bf5ae0",
			"#a811da"
		],
		"css": "linear-gradient(135deg, #bf5ae0, #a811da)"
	},
	{
		"id": "blu",
		"name": "Blu",
		"colors": [
			"#00416A",
			"#E4E5E6"
		],
		"css": "linear-gradient(135deg, #00416A, #E4E5E6)"
	},
	{
		"id": "summer-breeze",
		"name": "Summer Breeze",
		"colors": [
			"#fbed96",
			"#abecd6"
		],
		"css": "linear-gradient(135deg, #fbed96, #abecd6)"
	},
	{
		"id": "ver",
		"name": "Ver",
		"colors": [
			"#FFE000",
			"#799F0C"
		],
		"css": "linear-gradient(135deg, #FFE000, #799F0C)"
	},
	{
		"id": "ver-black",
		"name": "Ver Black",
		"colors": [
			"#F7F8F8",
			"#ACBB78"
		],
		"css": "linear-gradient(135deg, #F7F8F8, #ACBB78)"
	},
	{
		"id": "combi",
		"name": "Combi",
		"colors": [
			"#00416A",
			"#799F0C",
			"#FFE000"
		],
		"css": "linear-gradient(135deg, #00416A, #799F0C, #FFE000)"
	},
	{
		"id": "anwar",
		"name": "Anwar",
		"colors": [
			"#334d50",
			"#cbcaa5"
		],
		"css": "linear-gradient(135deg, #334d50, #cbcaa5)"
	},
	{
		"id": "bluelagoo",
		"name": "Bluelagoo",
		"colors": [
			"#0052D4",
			"#4364F7",
			"#6FB1FC"
		],
		"css": "linear-gradient(135deg, #0052D4, #4364F7, #6FB1FC)"
	},
	{
		"id": "lunada",
		"name": "Lunada",
		"colors": [
			"#5433FF",
			"#20BDFF",
			"#A5FECB"
		],
		"css": "linear-gradient(135deg, #5433FF, #20BDFF, #A5FECB)"
	},
	{
		"id": "reaqua",
		"name": "Reaqua",
		"colors": [
			"#799F0C",
			"#ACBB78"
		],
		"css": "linear-gradient(135deg, #799F0C, #ACBB78)"
	},
	{
		"id": "mango",
		"name": "Mango",
		"colors": [
			"#ffe259",
			"#ffa751"
		],
		"css": "linear-gradient(135deg, #ffe259, #ffa751)"
	},
	{
		"id": "bupe",
		"name": "Bupe",
		"colors": [
			"#00416A",
			"#E4E5E6"
		],
		"css": "linear-gradient(135deg, #00416A, #E4E5E6)"
	},
	{
		"id": "rea",
		"name": "Rea",
		"colors": [
			"#FFE000",
			"#799F0C"
		],
		"css": "linear-gradient(135deg, #FFE000, #799F0C)"
	},
	{
		"id": "windy",
		"name": "Windy",
		"colors": [
			"#acb6e5",
			"#86fde8"
		],
		"css": "linear-gradient(135deg, #acb6e5, #86fde8)"
	},
	{
		"id": "royal-blue",
		"name": "Royal Blue",
		"colors": [
			"#536976",
			"#292E49"
		],
		"css": "linear-gradient(135deg, #536976, #292E49)"
	},
	{
		"id": "royal-blue-petrol",
		"name": "Royal Blue + Petrol",
		"colors": [
			"#BBD2C5",
			"#536976",
			"#292E49"
		],
		"css": "linear-gradient(135deg, #BBD2C5, #536976, #292E49)"
	},
	{
		"id": "copper",
		"name": "Copper",
		"colors": [
			"#B79891",
			"#94716B"
		],
		"css": "linear-gradient(135deg, #B79891, #94716B)"
	},
	{
		"id": "anamnisar",
		"name": "Anamnisar",
		"colors": [
			"#9796f0",
			"#fbc7d4"
		],
		"css": "linear-gradient(135deg, #9796f0, #fbc7d4)"
	},
	{
		"id": "petrol",
		"name": "Petrol",
		"colors": [
			"#BBD2C5",
			"#536976"
		],
		"css": "linear-gradient(135deg, #BBD2C5, #536976)"
	},
	{
		"id": "sky",
		"name": "Sky",
		"colors": [
			"#076585",
			"#ffffff"
		],
		"css": "linear-gradient(135deg, #076585, #ffffff)"
	},
	{
		"id": "sel",
		"name": "Sel",
		"colors": [
			"#00467F",
			"#A5CC82"
		],
		"css": "linear-gradient(135deg, #00467F, #A5CC82)"
	},
	{
		"id": "afternoon",
		"name": "Afternoon",
		"colors": [
			"#000C40",
			"#607D8B"
		],
		"css": "linear-gradient(135deg, #000C40, #607D8B)"
	},
	{
		"id": "skyline",
		"name": "Skyline",
		"colors": [
			"#1488CC",
			"#2B32B2"
		],
		"css": "linear-gradient(135deg, #1488CC, #2B32B2)"
	},
	{
		"id": "dimigo",
		"name": "DIMIGO",
		"colors": [
			"#ec008c",
			"#fc6767"
		],
		"css": "linear-gradient(135deg, #ec008c, #fc6767)"
	},
	{
		"id": "purple-love",
		"name": "Purple Love",
		"colors": [
			"#cc2b5e",
			"#753a88"
		],
		"css": "linear-gradient(135deg, #cc2b5e, #753a88)"
	},
	{
		"id": "sexy-blue",
		"name": "Sexy Blue",
		"colors": [
			"#2193b0",
			"#6dd5ed"
		],
		"css": "linear-gradient(135deg, #2193b0, #6dd5ed)"
	},
	{
		"id": "blooker20",
		"name": "Blooker20",
		"colors": [
			"#e65c00",
			"#F9D423"
		],
		"css": "linear-gradient(135deg, #e65c00, #F9D423)"
	},
	{
		"id": "sea-blue",
		"name": "Sea Blue",
		"colors": [
			"#2b5876",
			"#4e4376"
		],
		"css": "linear-gradient(135deg, #2b5876, #4e4376)"
	},
	{
		"id": "nimvelo",
		"name": "Nimvelo",
		"colors": [
			"#314755",
			"#26a0da"
		],
		"css": "linear-gradient(135deg, #314755, #26a0da)"
	},
	{
		"id": "hazel",
		"name": "Hazel",
		"colors": [
			"#77A1D3",
			"#79CBCA",
			"#E684AE"
		],
		"css": "linear-gradient(135deg, #77A1D3, #79CBCA, #E684AE)"
	},
	{
		"id": "noon-to-dusk",
		"name": "Noon to Dusk",
		"colors": [
			"#ff6e7f",
			"#bfe9ff"
		],
		"css": "linear-gradient(135deg, #ff6e7f, #bfe9ff)"
	},
	{
		"id": "youtube",
		"name": "YouTube",
		"colors": [
			"#e52d27",
			"#b31217"
		],
		"css": "linear-gradient(135deg, #e52d27, #b31217)"
	},
	{
		"id": "cool-brown",
		"name": "Cool Brown",
		"colors": [
			"#603813",
			"#b29f94"
		],
		"css": "linear-gradient(135deg, #603813, #b29f94)"
	},
	{
		"id": "harmonic-energy",
		"name": "Harmonic Energy",
		"colors": [
			"#16A085",
			"#F4D03F"
		],
		"css": "linear-gradient(135deg, #16A085, #F4D03F)"
	},
	{
		"id": "playing-with-reds",
		"name": "Playing with Reds",
		"colors": [
			"#D31027",
			"#EA384D"
		],
		"css": "linear-gradient(135deg, #D31027, #EA384D)"
	},
	{
		"id": "sunny-days",
		"name": "Sunny Days",
		"colors": [
			"#EDE574",
			"#E1F5C4"
		],
		"css": "linear-gradient(135deg, #EDE574, #E1F5C4)"
	},
	{
		"id": "green-beach",
		"name": "Green Beach",
		"colors": [
			"#02AAB0",
			"#00CDAC"
		],
		"css": "linear-gradient(135deg, #02AAB0, #00CDAC)"
	},
	{
		"id": "intuitive-purple",
		"name": "Intuitive Purple",
		"colors": [
			"#DA22FF",
			"#9733EE"
		],
		"css": "linear-gradient(135deg, #DA22FF, #9733EE)"
	},
	{
		"id": "emerald-water",
		"name": "Emerald Water",
		"colors": [
			"#348F50",
			"#56B4D3"
		],
		"css": "linear-gradient(135deg, #348F50, #56B4D3)"
	},
	{
		"id": "lemon-twist",
		"name": "Lemon Twist",
		"colors": [
			"#3CA55C",
			"#B5AC49"
		],
		"css": "linear-gradient(135deg, #3CA55C, #B5AC49)"
	},
	{
		"id": "monte-carlo",
		"name": "Monte Carlo",
		"colors": [
			"#CC95C0",
			"#DBD4B4",
			"#7AA1D2"
		],
		"css": "linear-gradient(135deg, #CC95C0, #DBD4B4, #7AA1D2)"
	},
	{
		"id": "horizon",
		"name": "Horizon",
		"colors": [
			"#003973",
			"#E5E5BE"
		],
		"css": "linear-gradient(135deg, #003973, #E5E5BE)"
	},
	{
		"id": "rose-water",
		"name": "Rose Water",
		"colors": [
			"#E55D87",
			"#5FC3E4"
		],
		"css": "linear-gradient(135deg, #E55D87, #5FC3E4)"
	},
	{
		"id": "frozen",
		"name": "Frozen",
		"colors": [
			"#403B4A",
			"#E7E9BB"
		],
		"css": "linear-gradient(135deg, #403B4A, #E7E9BB)"
	},
	{
		"id": "mango-pulp",
		"name": "Mango Pulp",
		"colors": [
			"#F09819",
			"#EDDE5D"
		],
		"css": "linear-gradient(135deg, #F09819, #EDDE5D)"
	},
	{
		"id": "bloody-mary",
		"name": "Bloody Mary",
		"colors": [
			"#FF512F",
			"#DD2476"
		],
		"css": "linear-gradient(135deg, #FF512F, #DD2476)"
	},
	{
		"id": "aubergine",
		"name": "Aubergine",
		"colors": [
			"#AA076B",
			"#61045F"
		],
		"css": "linear-gradient(135deg, #AA076B, #61045F)"
	},
	{
		"id": "aqua-marine",
		"name": "Aqua Marine",
		"colors": [
			"#1A2980",
			"#26D0CE"
		],
		"css": "linear-gradient(135deg, #1A2980, #26D0CE)"
	},
	{
		"id": "sunrise",
		"name": "Sunrise",
		"colors": [
			"#FF512F",
			"#F09819"
		],
		"css": "linear-gradient(135deg, #FF512F, #F09819)"
	},
	{
		"id": "purple-paradise",
		"name": "Purple Paradise",
		"colors": [
			"#1D2B64",
			"#F8CDDA"
		],
		"css": "linear-gradient(135deg, #1D2B64, #F8CDDA)"
	},
	{
		"id": "stripe",
		"name": "Stripe",
		"colors": [
			"#1FA2FF",
			"#12D8FA",
			"#A6FFCB"
		],
		"css": "linear-gradient(135deg, #1FA2FF, #12D8FA, #A6FFCB)"
	},
	{
		"id": "sea-weed",
		"name": "Sea Weed",
		"colors": [
			"#4CB8C4",
			"#3CD3AD"
		],
		"css": "linear-gradient(135deg, #4CB8C4, #3CD3AD)"
	},
	{
		"id": "pinky",
		"name": "Pinky",
		"colors": [
			"#DD5E89",
			"#F7BB97"
		],
		"css": "linear-gradient(135deg, #DD5E89, #F7BB97)"
	},
	{
		"id": "cherry",
		"name": "Cherry",
		"colors": [
			"#EB3349",
			"#F45C43"
		],
		"css": "linear-gradient(135deg, #EB3349, #F45C43)"
	},
	{
		"id": "mojito",
		"name": "Mojito",
		"colors": [
			"#1D976C",
			"#93F9B9"
		],
		"css": "linear-gradient(135deg, #1D976C, #93F9B9)"
	},
	{
		"id": "juicy-orange",
		"name": "Juicy Orange",
		"colors": [
			"#FF8008",
			"#FFC837"
		],
		"css": "linear-gradient(135deg, #FF8008, #FFC837)"
	},
	{
		"id": "mirage",
		"name": "Mirage",
		"colors": [
			"#16222A",
			"#3A6073"
		],
		"css": "linear-gradient(135deg, #16222A, #3A6073)"
	},
	{
		"id": "steel-gray",
		"name": "Steel Gray",
		"colors": [
			"#1F1C2C",
			"#928DAB"
		],
		"css": "linear-gradient(135deg, #1F1C2C, #928DAB)"
	},
	{
		"id": "kashmir",
		"name": "Kashmir",
		"colors": [
			"#614385",
			"#516395"
		],
		"css": "linear-gradient(135deg, #614385, #516395)"
	},
	{
		"id": "electric-violet",
		"name": "Electric Violet",
		"colors": [
			"#4776E6",
			"#8E54E9"
		],
		"css": "linear-gradient(135deg, #4776E6, #8E54E9)"
	},
	{
		"id": "venice-blue",
		"name": "Venice Blue",
		"colors": [
			"#085078",
			"#85D8CE"
		],
		"css": "linear-gradient(135deg, #085078, #85D8CE)"
	},
	{
		"id": "bora-bora",
		"name": "Bora Bora",
		"colors": [
			"#2BC0E4",
			"#EAECC6"
		],
		"css": "linear-gradient(135deg, #2BC0E4, #EAECC6)"
	},
	{
		"id": "moss",
		"name": "Moss",
		"colors": [
			"#134E5E",
			"#71B280"
		],
		"css": "linear-gradient(135deg, #134E5E, #71B280)"
	},
	{
		"id": "shroom-haze",
		"name": "Shroom Haze",
		"colors": [
			"#5C258D",
			"#4389A2"
		],
		"css": "linear-gradient(135deg, #5C258D, #4389A2)"
	},
	{
		"id": "mystic",
		"name": "Mystic",
		"colors": [
			"#757F9A",
			"#D7DDE8"
		],
		"css": "linear-gradient(135deg, #757F9A, #D7DDE8)"
	},
	{
		"id": "midnight-city",
		"name": "Midnight City",
		"colors": [
			"#232526",
			"#414345"
		],
		"css": "linear-gradient(135deg, #232526, #414345)"
	},
	{
		"id": "sea-blizz",
		"name": "Sea Blizz",
		"colors": [
			"#1CD8D2",
			"#93EDC7"
		],
		"css": "linear-gradient(135deg, #1CD8D2, #93EDC7)"
	},
	{
		"id": "opa",
		"name": "Opa",
		"colors": [
			"#3D7EAA",
			"#FFE47A"
		],
		"css": "linear-gradient(135deg, #3D7EAA, #FFE47A)"
	},
	{
		"id": "titanium",
		"name": "Titanium",
		"colors": [
			"#283048",
			"#859398"
		],
		"css": "linear-gradient(135deg, #283048, #859398)"
	},
	{
		"id": "mantle",
		"name": "Mantle",
		"colors": [
			"#24C6DC",
			"#514A9D"
		],
		"css": "linear-gradient(135deg, #24C6DC, #514A9D)"
	},
	{
		"id": "dracula",
		"name": "Dracula",
		"colors": [
			"#DC2424",
			"#4A569D"
		],
		"css": "linear-gradient(135deg, #DC2424, #4A569D)"
	},
	{
		"id": "peach",
		"name": "Peach",
		"colors": [
			"#ED4264",
			"#FFEDBC"
		],
		"css": "linear-gradient(135deg, #ED4264, #FFEDBC)"
	},
	{
		"id": "moonrise",
		"name": "Moonrise",
		"colors": [
			"#DAE2F8",
			"#D6A4A4"
		],
		"css": "linear-gradient(135deg, #DAE2F8, #D6A4A4)"
	},
	{
		"id": "clouds",
		"name": "Clouds",
		"colors": [
			"#ECE9E6",
			"#FFFFFF"
		],
		"css": "linear-gradient(135deg, #ECE9E6, #FFFFFF)"
	},
	{
		"id": "stellar",
		"name": "Stellar",
		"colors": [
			"#7474BF",
			"#348AC7"
		],
		"css": "linear-gradient(135deg, #7474BF, #348AC7)"
	},
	{
		"id": "bourbon",
		"name": "Bourbon",
		"colors": [
			"#EC6F66",
			"#F3A183"
		],
		"css": "linear-gradient(135deg, #EC6F66, #F3A183)"
	},
	{
		"id": "calm-darya",
		"name": "Calm Darya",
		"colors": [
			"#5f2c82",
			"#49a09d"
		],
		"css": "linear-gradient(135deg, #5f2c82, #49a09d)"
	},
	{
		"id": "influenza",
		"name": "Influenza",
		"colors": [
			"#C04848",
			"#480048"
		],
		"css": "linear-gradient(135deg, #C04848, #480048)"
	},
	{
		"id": "shrimpy",
		"name": "Shrimpy",
		"colors": [
			"#e43a15",
			"#e65245"
		],
		"css": "linear-gradient(135deg, #e43a15, #e65245)"
	},
	{
		"id": "army",
		"name": "Army",
		"colors": [
			"#414d0b",
			"#727a17"
		],
		"css": "linear-gradient(135deg, #414d0b, #727a17)"
	},
	{
		"id": "miaka",
		"name": "Miaka",
		"colors": [
			"#FC354C",
			"#0ABFBC"
		],
		"css": "linear-gradient(135deg, #FC354C, #0ABFBC)"
	},
	{
		"id": "pinot-noir",
		"name": "Pinot Noir",
		"colors": [
			"#4b6cb7",
			"#182848"
		],
		"css": "linear-gradient(135deg, #4b6cb7, #182848)"
	},
	{
		"id": "day-tripper",
		"name": "Day Tripper",
		"colors": [
			"#f857a6",
			"#ff5858"
		],
		"css": "linear-gradient(135deg, #f857a6, #ff5858)"
	},
	{
		"id": "namn",
		"name": "Namn",
		"colors": [
			"#a73737",
			"#7a2828"
		],
		"css": "linear-gradient(135deg, #a73737, #7a2828)"
	},
	{
		"id": "blurry-beach",
		"name": "Blurry Beach",
		"colors": [
			"#d53369",
			"#cbad6d"
		],
		"css": "linear-gradient(135deg, #d53369, #cbad6d)"
	},
	{
		"id": "vasily",
		"name": "Vasily",
		"colors": [
			"#e9d362",
			"#333333"
		],
		"css": "linear-gradient(135deg, #e9d362, #333333)"
	},
	{
		"id": "a-lost-memory",
		"name": "A Lost Memory",
		"colors": [
			"#DE6262",
			"#FFB88C"
		],
		"css": "linear-gradient(135deg, #DE6262, #FFB88C)"
	},
	{
		"id": "petrichor",
		"name": "Petrichor",
		"colors": [
			"#666600",
			"#999966"
		],
		"css": "linear-gradient(135deg, #666600, #999966)"
	},
	{
		"id": "jonquil",
		"name": "Jonquil",
		"colors": [
			"#FFEEEE",
			"#DDEFBB"
		],
		"css": "linear-gradient(135deg, #FFEEEE, #DDEFBB)"
	},
	{
		"id": "sirius-tamed",
		"name": "Sirius Tamed",
		"colors": [
			"#EFEFBB",
			"#D4D3DD"
		],
		"css": "linear-gradient(135deg, #EFEFBB, #D4D3DD)"
	},
	{
		"id": "kyoto",
		"name": "Kyoto",
		"colors": [
			"#c21500",
			"#ffc500"
		],
		"css": "linear-gradient(135deg, #c21500, #ffc500)"
	},
	{
		"id": "misty-meadow",
		"name": "Misty Meadow",
		"colors": [
			"#215f00",
			"#e4e4d9"
		],
		"css": "linear-gradient(135deg, #215f00, #e4e4d9)"
	},
	{
		"id": "aqualicious",
		"name": "Aqualicious",
		"colors": [
			"#50C9C3",
			"#96DEDA"
		],
		"css": "linear-gradient(135deg, #50C9C3, #96DEDA)"
	},
	{
		"id": "moor",
		"name": "Moor",
		"colors": [
			"#616161",
			"#9bc5c3"
		],
		"css": "linear-gradient(135deg, #616161, #9bc5c3)"
	},
	{
		"id": "almost",
		"name": "Almost",
		"colors": [
			"#ddd6f3",
			"#faaca8"
		],
		"css": "linear-gradient(135deg, #ddd6f3, #faaca8)"
	},
	{
		"id": "forever-lost",
		"name": "Forever Lost",
		"colors": [
			"#5D4157",
			"#A8CABA"
		],
		"css": "linear-gradient(135deg, #5D4157, #A8CABA)"
	},
	{
		"id": "winter",
		"name": "Winter",
		"colors": [
			"#E6DADA",
			"#274046"
		],
		"css": "linear-gradient(135deg, #E6DADA, #274046)"
	},
	{
		"id": "nelson",
		"name": "Nelson",
		"colors": [
			"#f2709c",
			"#ff9472"
		],
		"css": "linear-gradient(135deg, #f2709c, #ff9472)"
	},
	{
		"id": "autumn",
		"name": "Autumn",
		"colors": [
			"#DAD299",
			"#B0DAB9"
		],
		"css": "linear-gradient(135deg, #DAD299, #B0DAB9)"
	},
	{
		"id": "candy",
		"name": "Candy",
		"colors": [
			"#D3959B",
			"#BFE6BA"
		],
		"css": "linear-gradient(135deg, #D3959B, #BFE6BA)"
	},
	{
		"id": "reef",
		"name": "Reef",
		"colors": [
			"#00d2ff",
			"#3a7bd5"
		],
		"css": "linear-gradient(135deg, #00d2ff, #3a7bd5)"
	},
	{
		"id": "the-strain",
		"name": "The Strain",
		"colors": [
			"#870000",
			"#190A05"
		],
		"css": "linear-gradient(135deg, #870000, #190A05)"
	},
	{
		"id": "dirty-fog",
		"name": "Dirty Fog",
		"colors": [
			"#B993D6",
			"#8CA6DB"
		],
		"css": "linear-gradient(135deg, #B993D6, #8CA6DB)"
	},
	{
		"id": "earthly",
		"name": "Earthly",
		"colors": [
			"#649173",
			"#DBD5A4"
		],
		"css": "linear-gradient(135deg, #649173, #DBD5A4)"
	},
	{
		"id": "virgin",
		"name": "Virgin",
		"colors": [
			"#C9FFBF",
			"#FFAFBD"
		],
		"css": "linear-gradient(135deg, #C9FFBF, #FFAFBD)"
	},
	{
		"id": "ash",
		"name": "Ash",
		"colors": [
			"#606c88",
			"#3f4c6b"
		],
		"css": "linear-gradient(135deg, #606c88, #3f4c6b)"
	},
	{
		"id": "cherryblossoms",
		"name": "Cherryblossoms",
		"colors": [
			"#FBD3E9",
			"#BB377D"
		],
		"css": "linear-gradient(135deg, #FBD3E9, #BB377D)"
	},
	{
		"id": "parklife",
		"name": "Parklife",
		"colors": [
			"#ADD100",
			"#7B920A"
		],
		"css": "linear-gradient(135deg, #ADD100, #7B920A)"
	},
	{
		"id": "dance-to-forget",
		"name": "Dance To Forget",
		"colors": [
			"#FF4E50",
			"#F9D423"
		],
		"css": "linear-gradient(135deg, #FF4E50, #F9D423)"
	},
	{
		"id": "starfall",
		"name": "Starfall",
		"colors": [
			"#F0C27B",
			"#4B1248"
		],
		"css": "linear-gradient(135deg, #F0C27B, #4B1248)"
	},
	{
		"id": "red-mist",
		"name": "Red Mist",
		"colors": [
			"#000000",
			"#e74c3c"
		],
		"css": "linear-gradient(135deg, #000000, #e74c3c)"
	},
	{
		"id": "teal-love",
		"name": "Teal Love",
		"colors": [
			"#AAFFA9",
			"#11FFBD"
		],
		"css": "linear-gradient(135deg, #AAFFA9, #11FFBD)"
	},
	{
		"id": "neon-life",
		"name": "Neon Life",
		"colors": [
			"#B3FFAB",
			"#12FFF7"
		],
		"css": "linear-gradient(135deg, #B3FFAB, #12FFF7)"
	},
	{
		"id": "man-of-steel",
		"name": "Man of Steel",
		"colors": [
			"#780206",
			"#061161"
		],
		"css": "linear-gradient(135deg, #780206, #061161)"
	},
	{
		"id": "amethyst",
		"name": "Amethyst",
		"colors": [
			"#9D50BB",
			"#6E48AA"
		],
		"css": "linear-gradient(135deg, #9D50BB, #6E48AA)"
	},
	{
		"id": "cheer-up-emo-kid",
		"name": "Cheer Up Emo Kid",
		"colors": [
			"#556270",
			"#FF6B6B"
		],
		"css": "linear-gradient(135deg, #556270, #FF6B6B)"
	},
	{
		"id": "shore",
		"name": "Shore",
		"colors": [
			"#70e1f5",
			"#ffd194"
		],
		"css": "linear-gradient(135deg, #70e1f5, #ffd194)"
	},
	{
		"id": "facebook-messenger",
		"name": "Facebook Messenger",
		"colors": [
			"#00c6ff",
			"#0072ff"
		],
		"css": "linear-gradient(135deg, #00c6ff, #0072ff)"
	},
	{
		"id": "soundcloud",
		"name": "SoundCloud",
		"colors": [
			"#fe8c00",
			"#f83600"
		],
		"css": "linear-gradient(135deg, #fe8c00, #f83600)"
	},
	{
		"id": "behongo",
		"name": "Behongo",
		"colors": [
			"#52c234",
			"#061700"
		],
		"css": "linear-gradient(135deg, #52c234, #061700)"
	},
	{
		"id": "servquick",
		"name": "ServQuick",
		"colors": [
			"#485563",
			"#29323c"
		],
		"css": "linear-gradient(135deg, #485563, #29323c)"
	},
	{
		"id": "friday",
		"name": "Friday",
		"colors": [
			"#83a4d4",
			"#b6fbff"
		],
		"css": "linear-gradient(135deg, #83a4d4, #b6fbff)"
	},
	{
		"id": "martini",
		"name": "Martini",
		"colors": [
			"#FDFC47",
			"#24FE41"
		],
		"css": "linear-gradient(135deg, #FDFC47, #24FE41)"
	},
	{
		"id": "metallic-toad",
		"name": "Metallic Toad",
		"colors": [
			"#abbaab",
			"#ffffff"
		],
		"css": "linear-gradient(135deg, #abbaab, #ffffff)"
	},
	{
		"id": "between-the-clouds",
		"name": "Between The Clouds",
		"colors": [
			"#73C8A9",
			"#373B44"
		],
		"css": "linear-gradient(135deg, #73C8A9, #373B44)"
	},
	{
		"id": "crazy-orange-i",
		"name": "Crazy Orange I",
		"colors": [
			"#D38312",
			"#A83279"
		],
		"css": "linear-gradient(135deg, #D38312, #A83279)"
	},
	{
		"id": "hersheys",
		"name": "Hersheys",
		"colors": [
			"#1e130c",
			"#9a8478"
		],
		"css": "linear-gradient(135deg, #1e130c, #9a8478)"
	},
	{
		"id": "talking-to-mice-elf",
		"name": "Talking To Mice Elf",
		"colors": [
			"#948E99",
			"#2E1437"
		],
		"css": "linear-gradient(135deg, #948E99, #2E1437)"
	},
	{
		"id": "purple-bliss",
		"name": "Purple Bliss",
		"colors": [
			"#360033",
			"#0b8793"
		],
		"css": "linear-gradient(135deg, #360033, #0b8793)"
	},
	{
		"id": "predawn",
		"name": "Predawn",
		"colors": [
			"#FFA17F",
			"#00223E"
		],
		"css": "linear-gradient(135deg, #FFA17F, #00223E)"
	},
	{
		"id": "endless-river",
		"name": "Endless River",
		"colors": [
			"#43cea2",
			"#185a9d"
		],
		"css": "linear-gradient(135deg, #43cea2, #185a9d)"
	},
	{
		"id": "pastel-orange-at-the-sun",
		"name": "Pastel Orange at the Sun",
		"colors": [
			"#ffb347",
			"#ffcc33"
		],
		"css": "linear-gradient(135deg, #ffb347, #ffcc33)"
	},
	{
		"id": "twitch",
		"name": "Twitch",
		"colors": [
			"#6441A5",
			"#2a0845"
		],
		"css": "linear-gradient(135deg, #6441A5, #2a0845)"
	},
	{
		"id": "atlas",
		"name": "Atlas",
		"colors": [
			"#FEAC5E",
			"#C779D0",
			"#4BC0C8"
		],
		"css": "linear-gradient(135deg, #FEAC5E, #C779D0, #4BC0C8)"
	},
	{
		"id": "instagram",
		"name": "Instagram",
		"colors": [
			"#833ab4",
			"#fd1d1d",
			"#fcb045"
		],
		"css": "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)"
	},
	{
		"id": "flickr",
		"name": "Flickr",
		"colors": [
			"#ff0084",
			"#33001b"
		],
		"css": "linear-gradient(135deg, #ff0084, #33001b)"
	},
	{
		"id": "vine",
		"name": "Vine",
		"colors": [
			"#00bf8f",
			"#001510"
		],
		"css": "linear-gradient(135deg, #00bf8f, #001510)"
	},
	{
		"id": "turquoise-flow",
		"name": "Turquoise flow",
		"colors": [
			"#136a8a",
			"#267871"
		],
		"css": "linear-gradient(135deg, #136a8a, #267871)"
	},
	{
		"id": "portrait",
		"name": "Portrait",
		"colors": [
			"#8e9eab",
			"#eef2f3"
		],
		"css": "linear-gradient(135deg, #8e9eab, #eef2f3)"
	},
	{
		"id": "virgin-america",
		"name": "Virgin America",
		"colors": [
			"#7b4397",
			"#dc2430"
		],
		"css": "linear-gradient(135deg, #7b4397, #dc2430)"
	},
	{
		"id": "koko-caramel",
		"name": "Koko Caramel",
		"colors": [
			"#D1913C",
			"#FFD194"
		],
		"css": "linear-gradient(135deg, #D1913C, #FFD194)"
	},
	{
		"id": "fresh-turboscent",
		"name": "Fresh Turboscent",
		"colors": [
			"#F1F2B5",
			"#135058"
		],
		"css": "linear-gradient(135deg, #F1F2B5, #135058)"
	},
	{
		"id": "green-to-dark",
		"name": "Green to dark",
		"colors": [
			"#6A9113",
			"#141517"
		],
		"css": "linear-gradient(135deg, #6A9113, #141517)"
	},
	{
		"id": "ukraine",
		"name": "Ukraine",
		"colors": [
			"#004FF9",
			"#FFF94C"
		],
		"css": "linear-gradient(135deg, #004FF9, #FFF94C)"
	},
	{
		"id": "curiosity-blue",
		"name": "Curiosity blue",
		"colors": [
			"#525252",
			"#3d72b4"
		],
		"css": "linear-gradient(135deg, #525252, #3d72b4)"
	},
	{
		"id": "dark-knight",
		"name": "Dark Knight",
		"colors": [
			"#BA8B02",
			"#181818"
		],
		"css": "linear-gradient(135deg, #BA8B02, #181818)"
	},
	{
		"id": "piglet",
		"name": "Piglet",
		"colors": [
			"#ee9ca7",
			"#ffdde1"
		],
		"css": "linear-gradient(135deg, #ee9ca7, #ffdde1)"
	},
	{
		"id": "lizard",
		"name": "Lizard",
		"colors": [
			"#304352",
			"#d7d2cc"
		],
		"css": "linear-gradient(135deg, #304352, #d7d2cc)"
	},
	{
		"id": "sage-persuasion",
		"name": "Sage Persuasion",
		"colors": [
			"#CCCCB2",
			"#757519"
		],
		"css": "linear-gradient(135deg, #CCCCB2, #757519)"
	},
	{
		"id": "between-night-and-day",
		"name": "Between Night and Day",
		"colors": [
			"#2c3e50",
			"#3498db"
		],
		"css": "linear-gradient(135deg, #2c3e50, #3498db)"
	},
	{
		"id": "timber",
		"name": "Timber",
		"colors": [
			"#fc00ff",
			"#00dbde"
		],
		"css": "linear-gradient(135deg, #fc00ff, #00dbde)"
	},
	{
		"id": "passion",
		"name": "Passion",
		"colors": [
			"#e53935",
			"#e35d5b"
		],
		"css": "linear-gradient(135deg, #e53935, #e35d5b)"
	},
	{
		"id": "clear-sky",
		"name": "Clear Sky",
		"colors": [
			"#005C97",
			"#363795"
		],
		"css": "linear-gradient(135deg, #005C97, #363795)"
	},
	{
		"id": "master-card",
		"name": "Master Card",
		"colors": [
			"#f46b45",
			"#eea849"
		],
		"css": "linear-gradient(135deg, #f46b45, #eea849)"
	},
	{
		"id": "back-to-earth",
		"name": "Back To Earth",
		"colors": [
			"#00C9FF",
			"#92FE9D"
		],
		"css": "linear-gradient(135deg, #00C9FF, #92FE9D)"
	},
	{
		"id": "deep-purple",
		"name": "Deep Purple",
		"colors": [
			"#673AB7",
			"#512DA8"
		],
		"css": "linear-gradient(135deg, #673AB7, #512DA8)"
	},
	{
		"id": "little-leaf",
		"name": "Little Leaf",
		"colors": [
			"#76b852",
			"#8DC26F"
		],
		"css": "linear-gradient(135deg, #76b852, #8DC26F)"
	},
	{
		"id": "netflix",
		"name": "Netflix",
		"colors": [
			"#8E0E00",
			"#1F1C18"
		],
		"css": "linear-gradient(135deg, #8E0E00, #1F1C18)"
	},
	{
		"id": "light-orange",
		"name": "Light Orange",
		"colors": [
			"#FFB75E",
			"#ED8F03"
		],
		"css": "linear-gradient(135deg, #FFB75E, #ED8F03)"
	},
	{
		"id": "green-and-blue",
		"name": "Green and Blue",
		"colors": [
			"#c2e59c",
			"#64b3f4"
		],
		"css": "linear-gradient(135deg, #c2e59c, #64b3f4)"
	},
	{
		"id": "poncho",
		"name": "Poncho",
		"colors": [
			"#403A3E",
			"#BE5869"
		],
		"css": "linear-gradient(135deg, #403A3E, #BE5869)"
	},
	{
		"id": "back-to-the-future",
		"name": "Back to the Future",
		"colors": [
			"#C02425",
			"#F0CB35"
		],
		"css": "linear-gradient(135deg, #C02425, #F0CB35)"
	},
	{
		"id": "blush",
		"name": "Blush",
		"colors": [
			"#B24592",
			"#F15F79"
		],
		"css": "linear-gradient(135deg, #B24592, #F15F79)"
	},
	{
		"id": "inbox",
		"name": "Inbox",
		"colors": [
			"#457fca",
			"#5691c8"
		],
		"css": "linear-gradient(135deg, #457fca, #5691c8)"
	},
	{
		"id": "purplin",
		"name": "Purplin",
		"colors": [
			"#6a3093",
			"#a044ff"
		],
		"css": "linear-gradient(135deg, #6a3093, #a044ff)"
	},
	{
		"id": "pale-wood",
		"name": "Pale Wood",
		"colors": [
			"#eacda3",
			"#d6ae7b"
		],
		"css": "linear-gradient(135deg, #eacda3, #d6ae7b)"
	},
	{
		"id": "haikus",
		"name": "Haikus",
		"colors": [
			"#fd746c",
			"#ff9068"
		],
		"css": "linear-gradient(135deg, #fd746c, #ff9068)"
	},
	{
		"id": "pizelex",
		"name": "Pizelex",
		"colors": [
			"#114357",
			"#F29492"
		],
		"css": "linear-gradient(135deg, #114357, #F29492)"
	},
	{
		"id": "joomla",
		"name": "Joomla",
		"colors": [
			"#1e3c72",
			"#2a5298"
		],
		"css": "linear-gradient(135deg, #1e3c72, #2a5298)"
	},
	{
		"id": "christmas",
		"name": "Christmas",
		"colors": [
			"#2F7336",
			"#AA3A38"
		],
		"css": "linear-gradient(135deg, #2F7336, #AA3A38)"
	},
	{
		"id": "minnesota-vikings",
		"name": "Minnesota Vikings",
		"colors": [
			"#5614B0",
			"#DBD65C"
		],
		"css": "linear-gradient(135deg, #5614B0, #DBD65C)"
	},
	{
		"id": "miami-dolphins",
		"name": "Miami Dolphins",
		"colors": [
			"#4DA0B0",
			"#D39D38"
		],
		"css": "linear-gradient(135deg, #4DA0B0, #D39D38)"
	},
	{
		"id": "forest",
		"name": "Forest",
		"colors": [
			"#5A3F37",
			"#2C7744"
		],
		"css": "linear-gradient(135deg, #5A3F37, #2C7744)"
	},
	{
		"id": "nighthawk",
		"name": "Nighthawk",
		"colors": [
			"#2980b9",
			"#2c3e50"
		],
		"css": "linear-gradient(135deg, #2980b9, #2c3e50)"
	},
	{
		"id": "superman",
		"name": "Superman",
		"colors": [
			"#0099F7",
			"#F11712"
		],
		"css": "linear-gradient(135deg, #0099F7, #F11712)"
	},
	{
		"id": "suzy",
		"name": "Suzy",
		"colors": [
			"#834d9b",
			"#d04ed6"
		],
		"css": "linear-gradient(135deg, #834d9b, #d04ed6)"
	},
	{
		"id": "dark-skies",
		"name": "Dark Skies",
		"colors": [
			"#4B79A1",
			"#283E51"
		],
		"css": "linear-gradient(135deg, #4B79A1, #283E51)"
	},
	{
		"id": "deep-space",
		"name": "Deep Space",
		"colors": [
			"#000000",
			"#434343"
		],
		"css": "linear-gradient(135deg, #000000, #434343)"
	},
	{
		"id": "decent",
		"name": "Decent",
		"colors": [
			"#4CA1AF",
			"#C4E0E5"
		],
		"css": "linear-gradient(135deg, #4CA1AF, #C4E0E5)"
	},
	{
		"id": "colors-of-sky",
		"name": "Colors Of Sky",
		"colors": [
			"#E0EAFC",
			"#CFDEF3"
		],
		"css": "linear-gradient(135deg, #E0EAFC, #CFDEF3)"
	},
	{
		"id": "purple-white",
		"name": "Purple White",
		"colors": [
			"#BA5370",
			"#F4E2D8"
		],
		"css": "linear-gradient(135deg, #BA5370, #F4E2D8)"
	},
	{
		"id": "ali",
		"name": "Ali",
		"colors": [
			"#ff4b1f",
			"#1fddff"
		],
		"css": "linear-gradient(135deg, #ff4b1f, #1fddff)"
	},
	{
		"id": "alihossein",
		"name": "Alihossein",
		"colors": [
			"#f7ff00",
			"#db36a4"
		],
		"css": "linear-gradient(135deg, #f7ff00, #db36a4)"
	},
	{
		"id": "shahabi",
		"name": "Shahabi",
		"colors": [
			"#a80077",
			"#66ff00"
		],
		"css": "linear-gradient(135deg, #a80077, #66ff00)"
	},
	{
		"id": "red-ocean",
		"name": "Red Ocean",
		"colors": [
			"#1D4350",
			"#A43931"
		],
		"css": "linear-gradient(135deg, #1D4350, #A43931)"
	},
	{
		"id": "tranquil",
		"name": "Tranquil",
		"colors": [
			"#EECDA3",
			"#EF629F"
		],
		"css": "linear-gradient(135deg, #EECDA3, #EF629F)"
	},
	{
		"id": "transfile",
		"name": "Transfile",
		"colors": [
			"#16BFFD",
			"#CB3066"
		],
		"css": "linear-gradient(135deg, #16BFFD, #CB3066)"
	},
	{
		"id": "sylvia",
		"name": "Sylvia",
		"colors": [
			"#ff4b1f",
			"#ff9068"
		],
		"css": "linear-gradient(135deg, #ff4b1f, #ff9068)"
	},
	{
		"id": "sweet-morning",
		"name": "Sweet Morning",
		"colors": [
			"#FF5F6D",
			"#FFC371"
		],
		"css": "linear-gradient(135deg, #FF5F6D, #FFC371)"
	},
	{
		"id": "politics",
		"name": "Politics",
		"colors": [
			"#2196f3",
			"#f44336"
		],
		"css": "linear-gradient(135deg, #2196f3, #f44336)"
	},
	{
		"id": "bright-vault",
		"name": "Bright Vault",
		"colors": [
			"#00d2ff",
			"#928DAB"
		],
		"css": "linear-gradient(135deg, #00d2ff, #928DAB)"
	},
	{
		"id": "solid-vault",
		"name": "Solid Vault",
		"colors": [
			"#3a7bd5",
			"#3a6073"
		],
		"css": "linear-gradient(135deg, #3a7bd5, #3a6073)"
	},
	{
		"id": "sunset",
		"name": "Sunset",
		"colors": [
			"#0B486B",
			"#F56217"
		],
		"css": "linear-gradient(135deg, #0B486B, #F56217)"
	},
	{
		"id": "grapefruit-sunset",
		"name": "Grapefruit Sunset",
		"colors": [
			"#e96443",
			"#904e95"
		],
		"css": "linear-gradient(135deg, #e96443, #904e95)"
	},
	{
		"id": "deep-sea-space",
		"name": "Deep Sea Space",
		"colors": [
			"#2C3E50",
			"#4CA1AF"
		],
		"css": "linear-gradient(135deg, #2C3E50, #4CA1AF)"
	},
	{
		"id": "dusk",
		"name": "Dusk",
		"colors": [
			"#2C3E50",
			"#FD746C"
		],
		"css": "linear-gradient(135deg, #2C3E50, #FD746C)"
	},
	{
		"id": "minimal-red",
		"name": "Minimal Red",
		"colors": [
			"#F00000",
			"#DC281E"
		],
		"css": "linear-gradient(135deg, #F00000, #DC281E)"
	},
	{
		"id": "royal",
		"name": "Royal",
		"colors": [
			"#141E30",
			"#243B55"
		],
		"css": "linear-gradient(135deg, #141E30, #243B55)"
	},
	{
		"id": "mauve",
		"name": "Mauve",
		"colors": [
			"#42275a",
			"#734b6d"
		],
		"css": "linear-gradient(135deg, #42275a, #734b6d)"
	},
	{
		"id": "frost",
		"name": "Frost",
		"colors": [
			"#000428",
			"#004e92"
		],
		"css": "linear-gradient(135deg, #000428, #004e92)"
	},
	{
		"id": "lush",
		"name": "Lush",
		"colors": [
			"#56ab2f",
			"#a8e063"
		],
		"css": "linear-gradient(135deg, #56ab2f, #a8e063)"
	},
	{
		"id": "firewatch",
		"name": "Firewatch",
		"colors": [
			"#cb2d3e",
			"#ef473a"
		],
		"css": "linear-gradient(135deg, #cb2d3e, #ef473a)"
	},
	{
		"id": "sherbert",
		"name": "Sherbert",
		"colors": [
			"#f79d00",
			"#64f38c"
		],
		"css": "linear-gradient(135deg, #f79d00, #64f38c)"
	},
	{
		"id": "blood-red",
		"name": "Blood Red",
		"colors": [
			"#f85032",
			"#e73827"
		],
		"css": "linear-gradient(135deg, #f85032, #e73827)"
	},
	{
		"id": "sun-on-the-horizon",
		"name": "Sun on the Horizon",
		"colors": [
			"#fceabb",
			"#f8b500"
		],
		"css": "linear-gradient(135deg, #fceabb, #f8b500)"
	},
	{
		"id": "iiit-delhi",
		"name": "IIIT Delhi",
		"colors": [
			"#808080",
			"#3fada8"
		],
		"css": "linear-gradient(135deg, #808080, #3fada8)"
	},
	{
		"id": "jupiter",
		"name": "Jupiter",
		"colors": [
			"#ffd89b",
			"#19547b"
		],
		"css": "linear-gradient(135deg, #ffd89b, #19547b)"
	},
	{
		"id": "50-shades-of-grey",
		"name": "50 Shades of Grey",
		"colors": [
			"#bdc3c7",
			"#2c3e50"
		],
		"css": "linear-gradient(135deg, #bdc3c7, #2c3e50)"
	},
	{
		"id": "dania",
		"name": "Dania",
		"colors": [
			"#BE93C5",
			"#7BC6CC"
		],
		"css": "linear-gradient(135deg, #BE93C5, #7BC6CC)"
	},
	{
		"id": "limeade",
		"name": "Limeade",
		"colors": [
			"#A1FFCE",
			"#FAFFD1"
		],
		"css": "linear-gradient(135deg, #A1FFCE, #FAFFD1)"
	},
	{
		"id": "disco",
		"name": "Disco",
		"colors": [
			"#4ECDC4",
			"#556270"
		],
		"css": "linear-gradient(135deg, #4ECDC4, #556270)"
	},
	{
		"id": "love-couple",
		"name": "Love Couple",
		"colors": [
			"#3a6186",
			"#89253e"
		],
		"css": "linear-gradient(135deg, #3a6186, #89253e)"
	},
	{
		"id": "azure-pop",
		"name": "Azure Pop",
		"colors": [
			"#ef32d9",
			"#89fffd"
		],
		"css": "linear-gradient(135deg, #ef32d9, #89fffd)"
	},
	{
		"id": "nepal",
		"name": "Nepal",
		"colors": [
			"#de6161",
			"#2657eb"
		],
		"css": "linear-gradient(135deg, #de6161, #2657eb)"
	},
	{
		"id": "cosmic-fusion",
		"name": "Cosmic Fusion",
		"colors": [
			"#ff00cc",
			"#333399"
		],
		"css": "linear-gradient(135deg, #ff00cc, #333399)"
	},
	{
		"id": "snapchat",
		"name": "Snapchat",
		"colors": [
			"#fffc00",
			"#ffffff"
		],
		"css": "linear-gradient(135deg, #fffc00, #ffffff)"
	},
	{
		"id": "ed-s-sunset-gradient",
		"name": "Ed's Sunset Gradient",
		"colors": [
			"#ff7e5f",
			"#feb47b"
		],
		"css": "linear-gradient(135deg, #ff7e5f, #feb47b)"
	},
	{
		"id": "brady-brady-fun-fun",
		"name": "Brady Brady Fun Fun",
		"colors": [
			"#00c3ff",
			"#ffff1c"
		],
		"css": "linear-gradient(135deg, #00c3ff, #ffff1c)"
	},
	{
		"id": "black-ros",
		"name": "Black Rosé",
		"colors": [
			"#f4c4f3",
			"#fc67fa"
		],
		"css": "linear-gradient(135deg, #f4c4f3, #fc67fa)"
	},
	{
		"id": "80-s-purple",
		"name": "80's Purple",
		"colors": [
			"#41295a",
			"#2F0743"
		],
		"css": "linear-gradient(135deg, #41295a, #2F0743)"
	},
	{
		"id": "radar",
		"name": "Radar",
		"colors": [
			"#A770EF",
			"#CF8BF3",
			"#FDB99B"
		],
		"css": "linear-gradient(135deg, #A770EF, #CF8BF3, #FDB99B)"
	},
	{
		"id": "ibiza-sunset",
		"name": "Ibiza Sunset",
		"colors": [
			"#ee0979",
			"#ff6a00"
		],
		"css": "linear-gradient(135deg, #ee0979, #ff6a00)"
	},
	{
		"id": "dawn",
		"name": "Dawn",
		"colors": [
			"#F3904F",
			"#3B4371"
		],
		"css": "linear-gradient(135deg, #F3904F, #3B4371)"
	},
	{
		"id": "mild",
		"name": "Mild",
		"colors": [
			"#67B26F",
			"#4ca2cd"
		],
		"css": "linear-gradient(135deg, #67B26F, #4ca2cd)"
	},
	{
		"id": "vice-city",
		"name": "Vice City",
		"colors": [
			"#3494E6",
			"#EC6EAD"
		],
		"css": "linear-gradient(135deg, #3494E6, #EC6EAD)"
	},
	{
		"id": "jaipur",
		"name": "Jaipur",
		"colors": [
			"#DBE6F6",
			"#C5796D"
		],
		"css": "linear-gradient(135deg, #DBE6F6, #C5796D)"
	},
	{
		"id": "jodhpur",
		"name": "Jodhpur",
		"colors": [
			"#9CECFB",
			"#65C7F7",
			"#0052D4"
		],
		"css": "linear-gradient(135deg, #9CECFB, #65C7F7, #0052D4)"
	},
	{
		"id": "cocoaa-ice",
		"name": "Cocoaa Ice",
		"colors": [
			"#c0c0aa",
			"#1cefff"
		],
		"css": "linear-gradient(135deg, #c0c0aa, #1cefff)"
	},
	{
		"id": "easymed",
		"name": "EasyMed",
		"colors": [
			"#DCE35B",
			"#45B649"
		],
		"css": "linear-gradient(135deg, #DCE35B, #45B649)"
	},
	{
		"id": "rose-colored-lenses",
		"name": "Rose Colored Lenses",
		"colors": [
			"#E8CBC0",
			"#636FA4"
		],
		"css": "linear-gradient(135deg, #E8CBC0, #636FA4)"
	},
	{
		"id": "what-lies-beyond",
		"name": "What lies Beyond",
		"colors": [
			"#F0F2F0",
			"#000C40"
		],
		"css": "linear-gradient(135deg, #F0F2F0, #000C40)"
	},
	{
		"id": "roseanna",
		"name": "Roseanna",
		"colors": [
			"#FFAFBD",
			"#ffc3a0"
		],
		"css": "linear-gradient(135deg, #FFAFBD, #ffc3a0)"
	},
	{
		"id": "honey-dew",
		"name": "Honey Dew",
		"colors": [
			"#43C6AC",
			"#F8FFAE"
		],
		"css": "linear-gradient(135deg, #43C6AC, #F8FFAE)"
	},
	{
		"id": "under-the-lake",
		"name": "Under the Lake",
		"colors": [
			"#093028",
			"#237A57"
		],
		"css": "linear-gradient(135deg, #093028, #237A57)"
	},
	{
		"id": "the-blue-lagoon",
		"name": "The Blue Lagoon",
		"colors": [
			"#43C6AC",
			"#191654"
		],
		"css": "linear-gradient(135deg, #43C6AC, #191654)"
	},
	{
		"id": "can-you-feel-the-love-tonight",
		"name": "Can You Feel The Love Tonight",
		"colors": [
			"#4568DC",
			"#B06AB3"
		],
		"css": "linear-gradient(135deg, #4568DC, #B06AB3)"
	},
	{
		"id": "very-blue",
		"name": "Very Blue",
		"colors": [
			"#0575E6",
			"#021B79"
		],
		"css": "linear-gradient(135deg, #0575E6, #021B79)"
	},
	{
		"id": "love-and-liberty",
		"name": "Love and Liberty",
		"colors": [
			"#200122",
			"#6f0000"
		],
		"css": "linear-gradient(135deg, #200122, #6f0000)"
	},
	{
		"id": "orca",
		"name": "Orca",
		"colors": [
			"#44A08D",
			"#093637"
		],
		"css": "linear-gradient(135deg, #44A08D, #093637)"
	},
	{
		"id": "venice",
		"name": "Venice",
		"colors": [
			"#6190E8",
			"#A7BFE8"
		],
		"css": "linear-gradient(135deg, #6190E8, #A7BFE8)"
	},
	{
		"id": "pacific-dream",
		"name": "Pacific Dream",
		"colors": [
			"#34e89e",
			"#0f3443"
		],
		"css": "linear-gradient(135deg, #34e89e, #0f3443)"
	},
	{
		"id": "learning-and-leading",
		"name": "Learning and Leading",
		"colors": [
			"#F7971E",
			"#FFD200"
		],
		"css": "linear-gradient(135deg, #F7971E, #FFD200)"
	},
	{
		"id": "celestial",
		"name": "Celestial",
		"colors": [
			"#C33764",
			"#1D2671"
		],
		"css": "linear-gradient(135deg, #C33764, #1D2671)"
	},
	{
		"id": "purplepine",
		"name": "Purplepine",
		"colors": [
			"#20002c",
			"#cbb4d4"
		],
		"css": "linear-gradient(135deg, #20002c, #cbb4d4)"
	},
	{
		"id": "sha-la-la",
		"name": "Sha la la",
		"colors": [
			"#D66D75",
			"#E29587"
		],
		"css": "linear-gradient(135deg, #D66D75, #E29587)"
	},
	{
		"id": "mini",
		"name": "Mini",
		"colors": [
			"#30E8BF",
			"#FF8235"
		],
		"css": "linear-gradient(135deg, #30E8BF, #FF8235)"
	},
	{
		"id": "maldives",
		"name": "Maldives",
		"colors": [
			"#B2FEFA",
			"#0ED2F7"
		],
		"css": "linear-gradient(135deg, #B2FEFA, #0ED2F7)"
	},
	{
		"id": "cinnamint",
		"name": "Cinnamint",
		"colors": [
			"#4AC29A",
			"#BDFFF3"
		],
		"css": "linear-gradient(135deg, #4AC29A, #BDFFF3)"
	},
	{
		"id": "html",
		"name": "Html",
		"colors": [
			"#E44D26",
			"#F16529"
		],
		"css": "linear-gradient(135deg, #E44D26, #F16529)"
	},
	{
		"id": "coal",
		"name": "Coal",
		"colors": [
			"#EB5757",
			"#000000"
		],
		"css": "linear-gradient(135deg, #EB5757, #000000)"
	},
	{
		"id": "sunkist",
		"name": "Sunkist",
		"colors": [
			"#F2994A",
			"#F2C94C"
		],
		"css": "linear-gradient(135deg, #F2994A, #F2C94C)"
	},
	{
		"id": "blue-skies",
		"name": "Blue Skies",
		"colors": [
			"#56CCF2",
			"#2F80ED"
		],
		"css": "linear-gradient(135deg, #56CCF2, #2F80ED)"
	},
	{
		"id": "chitty-chitty-bang-bang",
		"name": "Chitty Chitty Bang Bang",
		"colors": [
			"#007991",
			"#78ffd6"
		],
		"css": "linear-gradient(135deg, #007991, #78ffd6)"
	},
	{
		"id": "visions-of-grandeur",
		"name": "Visions of Grandeur",
		"colors": [
			"#000046",
			"#1CB5E0"
		],
		"css": "linear-gradient(135deg, #000046, #1CB5E0)"
	},
	{
		"id": "crystal-clear",
		"name": "Crystal Clear",
		"colors": [
			"#159957",
			"#155799"
		],
		"css": "linear-gradient(135deg, #159957, #155799)"
	},
	{
		"id": "mello",
		"name": "Mello",
		"colors": [
			"#c0392b",
			"#8e44ad"
		],
		"css": "linear-gradient(135deg, #c0392b, #8e44ad)"
	},
	{
		"id": "compare-now",
		"name": "Compare Now",
		"colors": [
			"#EF3B36",
			"#FFFFFF"
		],
		"css": "linear-gradient(135deg, #EF3B36, #FFFFFF)"
	},
	{
		"id": "meridian",
		"name": "Meridian",
		"colors": [
			"#283c86",
			"#45a247"
		],
		"css": "linear-gradient(135deg, #283c86, #45a247)"
	},
	{
		"id": "relay",
		"name": "Relay",
		"colors": [
			"#3A1C71",
			"#D76D77",
			"#FFAF7B"
		],
		"css": "linear-gradient(135deg, #3A1C71, #D76D77, #FFAF7B)"
	},
	{
		"id": "alive",
		"name": "Alive",
		"colors": [
			"#CB356B",
			"#BD3F32"
		],
		"css": "linear-gradient(135deg, #CB356B, #BD3F32)"
	},
	{
		"id": "scooter",
		"name": "Scooter",
		"colors": [
			"#36D1DC",
			"#5B86E5"
		],
		"css": "linear-gradient(135deg, #36D1DC, #5B86E5)"
	},
	{
		"id": "terminal",
		"name": "Terminal",
		"colors": [
			"#000000",
			"#0f9b0f"
		],
		"css": "linear-gradient(135deg, #000000, #0f9b0f)"
	},
	{
		"id": "telegram",
		"name": "Telegram",
		"colors": [
			"#1c92d2",
			"#f2fcfe"
		],
		"css": "linear-gradient(135deg, #1c92d2, #f2fcfe)"
	},
	{
		"id": "crimson-tide",
		"name": "Crimson Tide",
		"colors": [
			"#642B73",
			"#C6426E"
		],
		"css": "linear-gradient(135deg, #642B73, #C6426E)"
	},
	{
		"id": "socialive",
		"name": "Socialive",
		"colors": [
			"#06beb6",
			"#48b1bf"
		],
		"css": "linear-gradient(135deg, #06beb6, #48b1bf)"
	},
	{
		"id": "subu",
		"name": "Subu",
		"colors": [
			"#0cebeb",
			"#20e3b2",
			"#29ffc6"
		],
		"css": "linear-gradient(135deg, #0cebeb, #20e3b2, #29ffc6)"
	},
	{
		"id": "broken-hearts",
		"name": "Broken Hearts",
		"colors": [
			"#d9a7c7",
			"#fffcdc"
		],
		"css": "linear-gradient(135deg, #d9a7c7, #fffcdc)"
	},
	{
		"id": "kimoby-is-the-new-blue",
		"name": "Kimoby Is The New Blue",
		"colors": [
			"#396afc",
			"#2948ff"
		],
		"css": "linear-gradient(135deg, #396afc, #2948ff)"
	},
	{
		"id": "dull",
		"name": "Dull",
		"colors": [
			"#C9D6FF",
			"#E2E2E2"
		],
		"css": "linear-gradient(135deg, #C9D6FF, #E2E2E2)"
	},
	{
		"id": "purpink",
		"name": "Purpink",
		"colors": [
			"#7F00FF",
			"#E100FF"
		],
		"css": "linear-gradient(135deg, #7F00FF, #E100FF)"
	},
	{
		"id": "orange-coral",
		"name": "Orange Coral",
		"colors": [
			"#ff9966",
			"#ff5e62"
		],
		"css": "linear-gradient(135deg, #ff9966, #ff5e62)"
	},
	{
		"id": "summer",
		"name": "Summer",
		"colors": [
			"#22c1c3",
			"#fdbb2d"
		],
		"css": "linear-gradient(135deg, #22c1c3, #fdbb2d)"
	},
	{
		"id": "king-yna",
		"name": "King Yna",
		"colors": [
			"#1a2a6c",
			"#b21f1f",
			"#fdbb2d"
		],
		"css": "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)"
	},
	{
		"id": "velvet-sun",
		"name": "Velvet Sun",
		"colors": [
			"#e1eec3",
			"#f05053"
		],
		"css": "linear-gradient(135deg, #e1eec3, #f05053)"
	},
	{
		"id": "zinc",
		"name": "Zinc",
		"colors": [
			"#ADA996",
			"#F2F2F2",
			"#DBDBDB",
			"#EAEAEA"
		],
		"css": "linear-gradient(135deg, #ADA996, #F2F2F2, #DBDBDB, #EAEAEA)"
	},
	{
		"id": "hydrogen",
		"name": "Hydrogen",
		"colors": [
			"#667db6",
			"#0082c8",
			"#0082c8",
			"#667db6"
		],
		"css": "linear-gradient(135deg, #667db6, #0082c8, #0082c8, #667db6)"
	},
	{
		"id": "argon",
		"name": "Argon",
		"colors": [
			"#03001e",
			"#7303c0",
			"#ec38bc",
			"#fdeff9"
		],
		"css": "linear-gradient(135deg, #03001e, #7303c0, #ec38bc, #fdeff9)"
	},
	{
		"id": "lithium",
		"name": "Lithium",
		"colors": [
			"#6D6027",
			"#D3CBB8"
		],
		"css": "linear-gradient(135deg, #6D6027, #D3CBB8)"
	},
	{
		"id": "digital-water",
		"name": "Digital Water",
		"colors": [
			"#74ebd5",
			"#ACB6E5"
		],
		"css": "linear-gradient(135deg, #74ebd5, #ACB6E5)"
	},
	{
		"id": "orange-fun",
		"name": "Orange Fun",
		"colors": [
			"#fc4a1a",
			"#f7b733"
		],
		"css": "linear-gradient(135deg, #fc4a1a, #f7b733)"
	},
	{
		"id": "rainbow-blue",
		"name": "Rainbow Blue",
		"colors": [
			"#00F260",
			"#0575E6"
		],
		"css": "linear-gradient(135deg, #00F260, #0575E6)"
	},
	{
		"id": "pink-flavour",
		"name": "Pink Flavour",
		"colors": [
			"#800080",
			"#ffc0cb"
		],
		"css": "linear-gradient(135deg, #800080, #ffc0cb)"
	},
	{
		"id": "sulphur",
		"name": "Sulphur",
		"colors": [
			"#CAC531",
			"#F3F9A7"
		],
		"css": "linear-gradient(135deg, #CAC531, #F3F9A7)"
	},
	{
		"id": "selenium",
		"name": "Selenium",
		"colors": [
			"#3C3B3F",
			"#605C3C"
		],
		"css": "linear-gradient(135deg, #3C3B3F, #605C3C)"
	},
	{
		"id": "delicate",
		"name": "Delicate",
		"colors": [
			"#D3CCE3",
			"#E9E4F0"
		],
		"css": "linear-gradient(135deg, #D3CCE3, #E9E4F0)"
	},
	{
		"id": "ohhappiness",
		"name": "Ohhappiness",
		"colors": [
			"#00b09b",
			"#96c93d"
		],
		"css": "linear-gradient(135deg, #00b09b, #96c93d)"
	},
	{
		"id": "lawrencium",
		"name": "Lawrencium",
		"colors": [
			"#0f0c29",
			"#302b63",
			"#24243e"
		],
		"css": "linear-gradient(135deg, #0f0c29, #302b63, #24243e)"
	},
	{
		"id": "relaxing-red",
		"name": "Relaxing red",
		"colors": [
			"#fffbd5",
			"#b20a2c"
		],
		"css": "linear-gradient(135deg, #fffbd5, #b20a2c)"
	},
	{
		"id": "taran-tado",
		"name": "Taran Tado",
		"colors": [
			"#23074d",
			"#cc5333"
		],
		"css": "linear-gradient(135deg, #23074d, #cc5333)"
	},
	{
		"id": "bighead",
		"name": "Bighead",
		"colors": [
			"#c94b4b",
			"#4b134f"
		],
		"css": "linear-gradient(135deg, #c94b4b, #4b134f)"
	},
	{
		"id": "sublime-vivid",
		"name": "Sublime Vivid",
		"colors": [
			"#FC466B",
			"#3F5EFB"
		],
		"css": "linear-gradient(135deg, #FC466B, #3F5EFB)"
	},
	{
		"id": "sublime-light",
		"name": "Sublime Light",
		"colors": [
			"#FC5C7D",
			"#6A82FB"
		],
		"css": "linear-gradient(135deg, #FC5C7D, #6A82FB)"
	},
	{
		"id": "pun-yeta",
		"name": "Pun Yeta",
		"colors": [
			"#108dc7",
			"#ef8e38"
		],
		"css": "linear-gradient(135deg, #108dc7, #ef8e38)"
	},
	{
		"id": "quepal",
		"name": "Quepal",
		"colors": [
			"#11998e",
			"#38ef7d"
		],
		"css": "linear-gradient(135deg, #11998e, #38ef7d)"
	},
	{
		"id": "sand-to-blue",
		"name": "Sand to Blue",
		"colors": [
			"#3E5151",
			"#DECBA4"
		],
		"css": "linear-gradient(135deg, #3E5151, #DECBA4)"
	},
	{
		"id": "wedding-day-blues",
		"name": "Wedding Day Blues",
		"colors": [
			"#40E0D0",
			"#FF8C00",
			"#FF0080"
		],
		"css": "linear-gradient(135deg, #40E0D0, #FF8C00, #FF0080)"
	},
	{
		"id": "shifter",
		"name": "Shifter",
		"colors": [
			"#bc4e9c",
			"#f80759"
		],
		"css": "linear-gradient(135deg, #bc4e9c, #f80759)"
	},
	{
		"id": "red-sunset",
		"name": "Red Sunset",
		"colors": [
			"#355C7D",
			"#6C5B7B",
			"#C06C84"
		],
		"css": "linear-gradient(135deg, #355C7D, #6C5B7B, #C06C84)"
	},
	{
		"id": "moon-purple",
		"name": "Moon Purple",
		"colors": [
			"#4e54c8",
			"#8f94fb"
		],
		"css": "linear-gradient(135deg, #4e54c8, #8f94fb)"
	},
	{
		"id": "pure-lust",
		"name": "Pure Lust",
		"colors": [
			"#333333",
			"#dd1818"
		],
		"css": "linear-gradient(135deg, #333333, #dd1818)"
	},
	{
		"id": "slight-ocean-view",
		"name": "Slight Ocean View",
		"colors": [
			"#a8c0ff",
			"#3f2b96"
		],
		"css": "linear-gradient(135deg, #a8c0ff, #3f2b96)"
	},
	{
		"id": "expresso",
		"name": "eXpresso",
		"colors": [
			"#ad5389",
			"#3c1053"
		],
		"css": "linear-gradient(135deg, #ad5389, #3c1053)"
	},
	{
		"id": "shifty",
		"name": "Shifty",
		"colors": [
			"#636363",
			"#a2ab58"
		],
		"css": "linear-gradient(135deg, #636363, #a2ab58)"
	},
	{
		"id": "vanusa",
		"name": "Vanusa",
		"colors": [
			"#DA4453",
			"#89216B"
		],
		"css": "linear-gradient(135deg, #DA4453, #89216B)"
	},
	{
		"id": "evening-night",
		"name": "Evening Night",
		"colors": [
			"#005AA7",
			"#FFFDE4"
		],
		"css": "linear-gradient(135deg, #005AA7, #FFFDE4)"
	},
	{
		"id": "magic",
		"name": "Magic",
		"colors": [
			"#59C173",
			"#a17fe0",
			"#5D26C1"
		],
		"css": "linear-gradient(135deg, #59C173, #a17fe0, #5D26C1)"
	},
	{
		"id": "margo",
		"name": "Margo",
		"colors": [
			"#FFEFBA",
			"#FFFFFF"
		],
		"css": "linear-gradient(135deg, #FFEFBA, #FFFFFF)"
	},
	{
		"id": "blue-raspberry",
		"name": "Blue Raspberry",
		"colors": [
			"#00B4DB",
			"#0083B0"
		],
		"css": "linear-gradient(135deg, #00B4DB, #0083B0)"
	},
	{
		"id": "citrus-peel",
		"name": "Citrus Peel",
		"colors": [
			"#FDC830",
			"#F37335"
		],
		"css": "linear-gradient(135deg, #FDC830, #F37335)"
	},
	{
		"id": "sin-city-red",
		"name": "Sin City Red",
		"colors": [
			"#ED213A",
			"#93291E"
		],
		"css": "linear-gradient(135deg, #ED213A, #93291E)"
	},
	{
		"id": "rastafari",
		"name": "Rastafari",
		"colors": [
			"#1E9600",
			"#FFF200",
			"#FF0000"
		],
		"css": "linear-gradient(135deg, #1E9600, #FFF200, #FF0000)"
	},
	{
		"id": "summer-dog",
		"name": "Summer Dog",
		"colors": [
			"#a8ff78",
			"#78ffd6"
		],
		"css": "linear-gradient(135deg, #a8ff78, #78ffd6)"
	},
	{
		"id": "wiretap",
		"name": "Wiretap",
		"colors": [
			"#8A2387",
			"#E94057",
			"#F27121"
		],
		"css": "linear-gradient(135deg, #8A2387, #E94057, #F27121)"
	},
	{
		"id": "burning-orange",
		"name": "Burning Orange",
		"colors": [
			"#FF416C",
			"#FF4B2B"
		],
		"css": "linear-gradient(135deg, #FF416C, #FF4B2B)"
	},
	{
		"id": "ultra-voilet",
		"name": "Ultra Voilet",
		"colors": [
			"#654ea3",
			"#eaafc8"
		],
		"css": "linear-gradient(135deg, #654ea3, #eaafc8)"
	},
	{
		"id": "by-design",
		"name": "By Design",
		"colors": [
			"#009FFF",
			"#ec2F4B"
		],
		"css": "linear-gradient(135deg, #009FFF, #ec2F4B)"
	},
	{
		"id": "kyoo-tah",
		"name": "Kyoo Tah",
		"colors": [
			"#544a7d",
			"#ffd452"
		],
		"css": "linear-gradient(135deg, #544a7d, #ffd452)"
	},
	{
		"id": "kye-meh",
		"name": "Kye Meh",
		"colors": [
			"#8360c3",
			"#2ebf91"
		],
		"css": "linear-gradient(135deg, #8360c3, #2ebf91)"
	},
	{
		"id": "kyoo-pal",
		"name": "Kyoo Pal",
		"colors": [
			"#dd3e54",
			"#6be585"
		],
		"css": "linear-gradient(135deg, #dd3e54, #6be585)"
	},
	{
		"id": "metapolis",
		"name": "Metapolis",
		"colors": [
			"#659999",
			"#f4791f"
		],
		"css": "linear-gradient(135deg, #659999, #f4791f)"
	},
	{
		"id": "flare",
		"name": "Flare",
		"colors": [
			"#f12711",
			"#f5af19"
		],
		"css": "linear-gradient(135deg, #f12711, #f5af19)"
	},
	{
		"id": "witching-hour",
		"name": "Witching Hour",
		"colors": [
			"#c31432",
			"#240b36"
		],
		"css": "linear-gradient(135deg, #c31432, #240b36)"
	},
	{
		"id": "azur-lane",
		"name": "Azur Lane",
		"colors": [
			"#7F7FD5",
			"#86A8E7",
			"#91EAE4"
		],
		"css": "linear-gradient(135deg, #7F7FD5, #86A8E7, #91EAE4)"
	},
	{
		"id": "neuromancer",
		"name": "Neuromancer",
		"colors": [
			"#f953c6",
			"#b91d73"
		],
		"css": "linear-gradient(135deg, #f953c6, #b91d73)"
	},
	{
		"id": "harvey",
		"name": "Harvey",
		"colors": [
			"#1f4037",
			"#99f2c8"
		],
		"css": "linear-gradient(135deg, #1f4037, #99f2c8)"
	},
	{
		"id": "amin",
		"name": "Amin",
		"colors": [
			"#8E2DE2",
			"#4A00E0"
		],
		"css": "linear-gradient(135deg, #8E2DE2, #4A00E0)"
	},
	{
		"id": "memariani",
		"name": "Memariani",
		"colors": [
			"#aa4b6b",
			"#6b6b83",
			"#3b8d99"
		],
		"css": "linear-gradient(135deg, #aa4b6b, #6b6b83, #3b8d99)"
	},
	{
		"id": "yoda",
		"name": "Yoda",
		"colors": [
			"#FF0099",
			"#493240"
		],
		"css": "linear-gradient(135deg, #FF0099, #493240)"
	},
	{
		"id": "cool-sky",
		"name": "Cool Sky",
		"colors": [
			"#2980B9",
			"#6DD5FA",
			"#FFFFFF"
		],
		"css": "linear-gradient(135deg, #2980B9, #6DD5FA, #FFFFFF)"
	},
	{
		"id": "dark-ocean",
		"name": "Dark Ocean",
		"colors": [
			"#373B44",
			"#4286f4"
		],
		"css": "linear-gradient(135deg, #373B44, #4286f4)"
	},
	{
		"id": "evening-sunshine",
		"name": "Evening Sunshine",
		"colors": [
			"#b92b27",
			"#1565C0"
		],
		"css": "linear-gradient(135deg, #b92b27, #1565C0)"
	},
	{
		"id": "jshine",
		"name": "JShine",
		"colors": [
			"#12c2e9",
			"#c471ed",
			"#f64f59"
		],
		"css": "linear-gradient(135deg, #12c2e9, #c471ed, #f64f59)"
	},
	{
		"id": "moonlit-asteroid",
		"name": "Moonlit Asteroid",
		"colors": [
			"#0F2027",
			"#203A43",
			"#2C5364"
		],
		"css": "linear-gradient(135deg, #0F2027, #203A43, #2C5364)"
	},
	{
		"id": "megatron",
		"name": "MegaTron",
		"colors": [
			"#C6FFDD",
			"#FBD786",
			"#f7797d"
		],
		"css": "linear-gradient(135deg, #C6FFDD, #FBD786, #f7797d)"
	},
	{
		"id": "cool-blues",
		"name": "Cool Blues",
		"colors": [
			"#2193b0",
			"#6dd5ed"
		],
		"css": "linear-gradient(135deg, #2193b0, #6dd5ed)"
	},
	{
		"id": "piggy-pink",
		"name": "Piggy Pink",
		"colors": [
			"#ee9ca7",
			"#ffdde1"
		],
		"css": "linear-gradient(135deg, #ee9ca7, #ffdde1)"
	},
	{
		"id": "grade-grey",
		"name": "Grade Grey",
		"colors": [
			"#bdc3c7",
			"#2c3e50"
		],
		"css": "linear-gradient(135deg, #bdc3c7, #2c3e50)"
	},
	{
		"id": "telko",
		"name": "Telko",
		"colors": [
			"#F36222",
			"#5CB644",
			"#007FC3"
		],
		"css": "linear-gradient(135deg, #F36222, #5CB644, #007FC3)"
	},
	{
		"id": "zenta",
		"name": "Zenta",
		"colors": [
			"#2A2D3E",
			"#FECB6E"
		],
		"css": "linear-gradient(135deg, #2A2D3E, #FECB6E)"
	},
	{
		"id": "electric-peacock",
		"name": "Electric Peacock",
		"colors": [
			"#8a2be2",
			"#0000cd",
			"#228b22",
			"#ccff00"
		],
		"css": "linear-gradient(135deg, #8a2be2, #0000cd, #228b22, #ccff00)"
	},
	{
		"id": "under-blue-green",
		"name": "Under Blue Green",
		"colors": [
			"#051937",
			"#004d7a",
			"#008793",
			"#00bf72",
			"#a8eb12"
		],
		"css": "linear-gradient(135deg, #051937, #004d7a, #008793, #00bf72, #a8eb12)"
	},
	{
		"id": "lensod",
		"name": "Lensod",
		"colors": [
			"#6025F5",
			"#FF5555"
		],
		"css": "linear-gradient(135deg, #6025F5, #FF5555)"
	},
	{
		"id": "newspaper",
		"name": "Newspaper",
		"colors": [
			"#8a2be2",
			"#ffa500",
			"#f8f8ff"
		],
		"css": "linear-gradient(135deg, #8a2be2, #ffa500, #f8f8ff)"
	},
	{
		"id": "dark-blue-gradient",
		"name": "Dark Blue Gradient",
		"colors": [
			"#2774ae",
			"#002E5D",
			"#002E5D"
		],
		"css": "linear-gradient(135deg, #2774ae, #002E5D, #002E5D)"
	},
	{
		"id": "dark-blu-two",
		"name": "Dark Blu Two",
		"colors": [
			"#004680",
			"#4484BA"
		],
		"css": "linear-gradient(135deg, #004680, #4484BA)"
	},
	{
		"id": "lemon-lime",
		"name": "Lemon Lime",
		"colors": [
			"#7ec6bc",
			"#ebe717"
		],
		"css": "linear-gradient(135deg, #7ec6bc, #ebe717)"
	},
	{
		"id": "beleko",
		"name": "Beleko",
		"colors": [
			"#ff1e56",
			"#f9c942",
			"#1e90ff"
		],
		"css": "linear-gradient(135deg, #ff1e56, #f9c942, #1e90ff)"
	},
	{
		"id": "mango-papaya",
		"name": "Mango Papaya",
		"colors": [
			"#de8a41",
			"#2ada53"
		],
		"css": "linear-gradient(135deg, #de8a41, #2ada53)"
	},
	{
		"id": "unicorn-rainbow",
		"name": "Unicorn Rainbow",
		"colors": [
			"#f7f0ac",
			"#acf7f0",
			"#f0acf7"
		],
		"css": "linear-gradient(135deg, #f7f0ac, #acf7f0, #f0acf7)"
	},
	{
		"id": "flame",
		"name": "Flame",
		"colors": [
			"#ff0000",
			"#fdcf58"
		],
		"css": "linear-gradient(135deg, #ff0000, #fdcf58)"
	},
	{
		"id": "blue-red",
		"name": "Blue Red",
		"colors": [
			"#36B1C7",
			"#960B33"
		],
		"css": "linear-gradient(135deg, #36B1C7, #960B33)"
	},
	{
		"id": "twitter",
		"name": "Twitter",
		"colors": [
			"#1DA1F2",
			"#009ffc"
		],
		"css": "linear-gradient(135deg, #1DA1F2, #009ffc)"
	},
	{
		"id": "blooze",
		"name": "Blooze",
		"colors": [
			"#6da6be",
			"#4b859e",
			"#6da6be"
		],
		"css": "linear-gradient(135deg, #6da6be, #4b859e, #6da6be)"
	},
	{
		"id": "blue-slate",
		"name": "Blue Slate",
		"colors": [
			"#B5B9FF",
			"#2B2C49"
		],
		"css": "linear-gradient(135deg, #B5B9FF, #2B2C49)"
	},
	{
		"id": "space-light-green",
		"name": "Space Light Green",
		"colors": [
			"#9FA0A8",
			"#5C7852"
		],
		"css": "linear-gradient(135deg, #9FA0A8, #5C7852)"
	},
	{
		"id": "flower",
		"name": "Flower",
		"colors": [
			"#DCFFBD",
			"#CC86D1"
		],
		"css": "linear-gradient(135deg, #DCFFBD, #CC86D1)"
	},
	{
		"id": "elate-the-euge",
		"name": "Elate The Euge",
		"colors": [
			"#8BDEDA",
			"#43ADD0",
			"#998EE0",
			"#E17DC2",
			"#EF9393"
		],
		"css": "linear-gradient(135deg, #8BDEDA, #43ADD0, #998EE0, #E17DC2, #EF9393)"
	},
	{
		"id": "peach-sea",
		"name": "Peach Sea",
		"colors": [
			"#E6AE8C",
			"#A8CECF"
		],
		"css": "linear-gradient(135deg, #E6AE8C, #A8CECF)"
	},
	{
		"id": "abbas",
		"name": "Abbas",
		"colors": [
			"#00fff0",
			"#0083fe"
		],
		"css": "linear-gradient(135deg, #00fff0, #0083fe)"
	},
	{
		"id": "winter-woods",
		"name": "Winter Woods",
		"colors": [
			"#333333",
			"#a2ab58",
			"#A43931"
		],
		"css": "linear-gradient(135deg, #333333, #a2ab58, #A43931)"
	},
	{
		"id": "ameena",
		"name": "Ameena",
		"colors": [
			"#0c0c6d",
			"#de512b",
			"#98d0c1",
			"#5bb226",
			"#023c0d"
		],
		"css": "linear-gradient(135deg, #0c0c6d, #de512b, #98d0c1, #5bb226, #023c0d)"
	},
	{
		"id": "emerald-sea",
		"name": "Emerald Sea",
		"colors": [
			"#05386b",
			"#5cdb95"
		],
		"css": "linear-gradient(135deg, #05386b, #5cdb95)"
	},
	{
		"id": "bleem",
		"name": "Bleem",
		"colors": [
			"#4284DB",
			"#29EAC4"
		],
		"css": "linear-gradient(135deg, #4284DB, #29EAC4)"
	},
	{
		"id": "coffee-gold",
		"name": "Coffee Gold",
		"colors": [
			"#554023",
			"#c99846"
		],
		"css": "linear-gradient(135deg, #554023, #c99846)"
	},
	{
		"id": "compass",
		"name": "Compass",
		"colors": [
			"#516b8b",
			"#056b3b"
		],
		"css": "linear-gradient(135deg, #516b8b, #056b3b)"
	},
	{
		"id": "andreuzza-s",
		"name": "Andreuzza's",
		"colors": [
			"#D70652",
			"#FF025E"
		],
		"css": "linear-gradient(135deg, #D70652, #FF025E)"
	},
	{
		"id": "moonwalker",
		"name": "Moonwalker",
		"colors": [
			"#152331",
			"#000000"
		],
		"css": "linear-gradient(135deg, #152331, #000000)"
	},
	{
		"id": "whinehouse",
		"name": "Whinehouse",
		"colors": [
			"#f7f7f7",
			"#b9a0a0",
			"#794747",
			"#4e2020",
			"#111111"
		],
		"css": "linear-gradient(135deg, #f7f7f7, #b9a0a0, #794747, #4e2020, #111111)"
	},
	{
		"id": "hyper-blue",
		"name": "Hyper Blue",
		"colors": [
			"#59CDE9",
			"#0A2A88"
		],
		"css": "linear-gradient(135deg, #59CDE9, #0A2A88)"
	},
	{
		"id": "racker",
		"name": "Racker",
		"colors": [
			"#EB0000",
			"#95008A",
			"#3300FC"
		],
		"css": "linear-gradient(135deg, #EB0000, #95008A, #3300FC)"
	},
	{
		"id": "after-the-rain",
		"name": "After the Rain",
		"colors": [
			"#ff75c3",
			"#ffa647",
			"#ffe83f",
			"#9fff5b",
			"#70e2ff",
			"#cd93ff"
		],
		"css": "linear-gradient(135deg, #ff75c3, #ffa647, #ffe83f, #9fff5b, #70e2ff, #cd93ff)"
	},
	{
		"id": "neon-green",
		"name": "Neon Green",
		"colors": [
			"#81ff8a",
			"#64965e"
		],
		"css": "linear-gradient(135deg, #81ff8a, #64965e)"
	},
	{
		"id": "dusty-grass",
		"name": "Dusty Grass",
		"colors": [
			"#d4fc79",
			"#96e6a1"
		],
		"css": "linear-gradient(135deg, #d4fc79, #96e6a1)"
	},
	{
		"id": "visual-blue",
		"name": "Visual Blue",
		"colors": [
			"#003d4d",
			"#00c996"
		],
		"css": "linear-gradient(135deg, #003d4d, #00c996)"
	}
];
