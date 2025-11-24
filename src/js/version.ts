export const version: string = "v1.3.0";

let version_element = document.getElementById("idris-version");

if (version_element !== null) version_element.innerHTML = version;