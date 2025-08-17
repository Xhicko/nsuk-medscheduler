/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: ["class"],
   content: ["./src/**/*.{js,jsx,ts,tsx}"],
   theme: {
   	extend: {
   		colors: {
   			border: 'hsl(var(--border))',
   			input: 'hsl(var(--input))',
   			ring: 'hsl(var(--ring))',
   			background: 'hsl(var(--background))',
   			foreground: 'hsl(var(--foreground))',
   			primary: {
   				DEFAULT: 'hsl(var(--primary))',
   				foreground: 'hsl(var(--primary-foreground))'
   			},
   			secondary: {
   				DEFAULT: 'hsl(var(--secondary))',
   				foreground: 'hsl(var(--secondary-foreground))'
   			},
   			destructive: {
   				DEFAULT: 'hsl(var(--destructive))',
   				foreground: 'hsl(var(--destructive-foreground))'
   			},
   			muted: {
   				DEFAULT: 'hsl(var(--muted))',
   				foreground: 'hsl(var(--muted-foreground))'
   			},
   			accent: {
   				DEFAULT: 'hsl(var(--accent))',
   				foreground: 'hsl(var(--accent-foreground))'
   			},
   			popover: {
   				DEFAULT: 'hsl(var(--popover))',
   				foreground: 'hsl(var(--popover-foreground))'
   			},
   			card: {
   				DEFAULT: 'hsl(var(--card))',
   				foreground: 'hsl(var(--card-foreground))'
   			},
   			custom: {
   				light: {
   					body: 'hsl(var(--light-body))',
   					text: 'hsl(var(--light-text))',
   					text2: 'hsl(var(--light-text2))',
   					faded: 'hsl(var(--light-faded))',
   					side: 'hsl(var(--light-side))',
   					logo: 'hsl(var(--light-logo))',
   					hover: 'hsl(var(--light-hover))',
   					focused: 'hsl(var(--light-focused))',
   					focusedText: 'hsl(var(--light-focused-text))',
   					overlay: 'hsl(var(--light-overlay))',
   					tertiary: 'hsl(var(--light-tertiary))',
   					boxShadow: 'hsl(var(--light-box-shadow))',
   					boxShadowSecondary: 'hsl(var(--light-box-shadow-secondary))',
   					iconBase: 'hsl(var(--light-icon-base))',
   					icon: 'hsl(var(--light-icon))'
   				},
   				dark: {
   					body: 'hsl(var(--dark-body))',
   					text: 'hsl(var(--dark-text))',
   					text2: 'hsl(var(--dark-text2))',
   					faded: 'hsl(var(--dark-faded))',
   					side: 'hsl(var(--dark-side))',
   					logo: 'hsl(var(--dark-logo))',
   					hover: 'hsl(var(--dark-hover))',
   					focused: 'hsl(var(--dark-focused))',
   					focusedText: 'hsl(var(--dark-focused-text))',
   					overlay: 'hsl(var(--dark-overlay))',
   					tertiary: 'hsl(var(--dark-tertiary))',
   					boxShadow: 'hsl(var(--dark-box-shadow))',
   					boxShadowSecondary: 'hsl(var(--dark-box-shadow-secondary))',
   					iconBase: 'hsl(var(--dark-icon-base))',
   					icon: 'hsl(var(--dark-icon))'
   				}
   			},
   			sidebar: {
   				DEFAULT: 'hsl(var(--sidebar-background))',
   				foreground: 'hsl(var(--sidebar-foreground))',
   				primary: 'hsl(var(--sidebar-primary))',
   				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
   				accent: 'hsl(var(--sidebar-accent))',
   				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
   				border: 'hsl(var(--sidebar-border))',
   				ring: 'hsl(var(--sidebar-ring))'
   			}
   		},
   		borderRadius: {
   			lg: '`var(--radius)`',
   			md: '`calc(var(--radius) - 2px)`',
   			sm: 'calc(var(--radius) - 4px)'
   		},
   		boxShadow: {
   			themeLight: '0 2px 4px hsl(var(--light-box-shadow-secondary))',
   			themeDark: '0 2px 4px hsl(var(--dark-box-shadow-secondary))'
   		},
         animation: {
            heartbeat: "heartbeat 1s ease-in-out infinite",
          },
          keyframes: {
            heartbeat: {
               "0%, 100%": { transform: "scale(1)" },
               "50%": { transform: "scale(1.2)" },
             },
          },
		   screens: {
			xs: '320px',
			xsm: '360px',
			midlg: '900px', 
			},
   	}
   },
   plugins: [require("tailwindcss-animate"),
      require('@tailwindcss/aspect-ratio'),
   ],
   fontFamily: {
      sans: ['Inter', 'sans-serif'], 
      inter: ['Inter', 'sans-serif']
    },
   
 }
 