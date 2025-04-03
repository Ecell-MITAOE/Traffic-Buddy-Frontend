/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors:{
				bgPrimary:"var(--color-bg-primary)",
				bgSecondary:"var(--color-bg-secondary)",

				borderPrimary:"var(--color-primary-border)",
				borderSecondary:"var(--color-secondary-border)",

				primary:"var(--color-primary)",
				hovPrimary:"var(--color-primary-hov)",

				secondary:"var(--color-secondary)",	
				hovSecondary:"var(--color-secondary-hov)",	

				tBase:"var(--color-text-base)",
				tSecondary:"var(--color-text-secondary)",
				tTrafficReports:"var(--color-text-traffic-reports)",

				btnDisabled:"var(--color-button-disabled)",
				tDisabled:"var(--color-text-disabled)",

				seperationPrimary:"var(--color-primary-divider)",
				seperationSecondary:"var(--color-secondary-divider)",
				
			}
		},
	},
	plugins: [],
};