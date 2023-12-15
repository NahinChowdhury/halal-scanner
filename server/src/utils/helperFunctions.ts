export function convertToAMPM(date: Date){
    return `${date.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })} ${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
}