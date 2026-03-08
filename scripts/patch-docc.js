import fs from 'fs'

const filePath = 'docs/public/sdk-swift/documentation/kurozorakit/index.html'
const scriptToInject = `<script>window.parent.postMessage('READY_FOR_THEME', '*'); window.addEventListener('message', (event) => { if (event.data.type === 'THEME_UPDATE') { const { appearance, vpcBG, vpcBGSoft, vpcText1, vpcBrand1, vpcBrand2, vpcBGAlt } = event.data; localStorage.setItem('developer.setting.preferredColorScheme', appearance); document.body.setAttribute('data-color-scheme', appearance); const r = document.documentElement; r.style.setProperty('--vp-c-bg', vpcBG); r.style.setProperty('--vp-c-bg-soft', vpcBGSoft); r.style.setProperty('--vp-c-text-1', vpcText1); r.style.setProperty('--vp-c-brand-1', vpcBrand1); r.style.setProperty('--vp-c-brand-2', vpcBrand2); r.style.setProperty('--vp-c-bg-alt', vpcBGAlt); const f = document.querySelector('footer'); if(f) f.style.display = 'none'; } });</script>`

try {
    let content = fs.readFileSync(filePath, 'utf8')

    if (!content.includes('READY_FOR_THEME')) {
        const newContent = content.replace('</body>', `${scriptToInject}</body>`)
        fs.writeFileSync(filePath, newContent, 'utf8')
        console.log('✅ Script injected successfully.')
    } else {
        console.log('ℹ️ Script exists. Skipping injection.')
    }
} catch (err) {
    console.error('❌ Error when injecting script:', err.message)
}
