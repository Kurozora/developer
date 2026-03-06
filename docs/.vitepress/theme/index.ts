// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { watch, onMounted, nextTick } from 'vue'
import { useData } from 'vitepress'

export default {
    extends: DefaultTheme,
    setup() {
        const { isDark, site } = useData()

        const getAppearanceMode = () => {
            const saved = localStorage.getItem('vitepress-theme-appearance')

            if (saved === 'light' || saved === 'dark') {
                return saved
            }

            // Fallback to the site config (default is 'auto'/true)
            const config = site.value.appearance

            if (config === 'force-dark') {
                return 'dark'
            }
            if (config === false) {
                return 'light'
            }

            return 'auto'
        }

        const sendThemeData = async () => {
            const iframe = document.querySelector('iframe')

            if (!iframe?.contentWindow) {
                return
            }

            await nextTick()

            setTimeout(() => {
                const styles = getComputedStyle(document.documentElement)
                const getVal = (prop) => styles.getPropertyValue(prop).trim()

                iframe.contentWindow.postMessage({
                    type: 'THEME_UPDATE',
                    appearance: getAppearanceMode(),
                    vpcBG: getVal('--vp-c-bg'),
                    vpcBGSoft: getVal('--vp-c-bg-soft'),
                    vpcText1: getVal('--vp-c-text-1'),
                    vpcBrand1: getVal('--vp-c-brand-1'),
                    vpcBrand2: getVal('--vp-c-brand-2'),
                    vpcBGAlt: getVal('--vp-c-bg-alt')
                }, '*')
            }, 10)
        }

        onMounted(() => {
            watch(isDark, sendThemeData)

            window.addEventListener('message', (event) => {
                if (event.data === 'READY_FOR_THEME') {
                    sendThemeData()
                }
            })
        })
    }
}
