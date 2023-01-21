window.addEventListener('load', function () {
    document.getElementById("theme-list").addEventListener("click", function (e) {
        let iframe = document.querySelector('.giscus-frame');
        if (!iframe) return;

        if (e.target.className !== "theme theme-selected") return;

        let theme = e.target.id;

        // 若当前 mdbook 主题不是 Light 或 Rust ，则将 giscuz 主题设置为 transparent_dark
        let giscusTheme = "light"
        if (theme !== "light" && theme !== "rust") {
            giscusTheme = "transparent_dark";
        }

        iframe.contentWindow.postMessage({giscus: {setConfig: {theme: giscusTheme}}}, 'https://giscus.app');
    });

    let giscusTheme = "light";
    const themeClass = document.getElementsByTagName("html")[0].className;
    if (themeClass.indexOf("light") === -1 && themeClass.indexOf("rust") === -1) {
        giscusTheme = "transparent_dark";
    }

    const element = document.createElement("script");
    element.type = "text/javascript";
    element.src = "https://giscus.app/client.js";
    element.crossOrigin = "anonymous";
    element.async = true;

    element.setAttribute("data-repo", "baerwang/mdbook");
    element.setAttribute("data-repo-id", "R_kgDOIzBFsg");
    element.setAttribute("data-category", "General");
    element.setAttribute("data-category-id", "DIC_kwDOIzBFss4CTshs");
    element.setAttribute("data-mapping", "pathname");
    element.setAttribute("data-term", "0");
    element.setAttribute("data-reactions-enabled", "1");
    element.setAttribute("data-emit-metadata", "0");
    element.setAttribute("data-input-position", "bottom");
    element.setAttribute("data-theme", giscusTheme);
    element.setAttribute("data-lang", "zh-CN");
    element.setAttribute("data-loading", "lazy");
    document.getElementById("giscus-container").appendChild(element);
});

