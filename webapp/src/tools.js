/**
 *
 *
 * @param {string[]} templates
 * @param {string[]} values
 * @return {HTMLElement} 
 */
 const html = function (templates, ...values) {
    const template = document.createElement('template')
    let str = ''
    templates.forEach((template, index) => {
        str += template
        str = values[index] ? str + values[index] : str
    })

    template.innerHTML = str.trim()
    return template.content.firstChild
}


// function importScript(url) {
//     const newScript = document.createElement("script")
//     newScript.src = url //"http://www.example.com/my-script.js"
//     target.appendChild(newScript)

//     // var newScript = document.createElement("script");
//     // var inlineScript = document.createTextNode("alert('Hello World!');");
//     // newScript.appendChild(inlineScript); 
//     // target.appendChild(newScript);

// }
