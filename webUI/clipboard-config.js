// const clipboard = new ClipboardJS(".button,a,input");
const clipboard = new ClipboardJS('[clipboard-copy="true"]');
console.info("clipboard.js read:Redy.")

clipboard.on('success', function (e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);
    copyTooltipOnClipboard(e.trigger);
});

clipboard.on('error', function (e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);
});