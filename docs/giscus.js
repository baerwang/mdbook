var giscus = function () {
    document.getElementById("theme-list").addEventListener("click", function (e) {
        var iframe = document.querySelector('.giscus-frame');
        if (!iframe) return;
        var theme;
        if (e.target.className === "theme") {
            theme = e.target.id;
        } else {
            return;
        }

        // 若当前 mdbook 主题不是 Light 或 Rust ，则将 giscuz 主题设置为 transparent_dark
        var giscusTheme = "light"
        if (theme != "light" && theme != "rust") {
            giscusTheme = "transparent_dark";
        }

        var msg = {
            setConfig: {
                theme: giscusTheme
            }
        };
        iframe.contentWindow.postMessage({giscus: msg}, 'https://giscus.app');
    });

    var giscusTheme = "light";
    const themeClass = document.getElementsByTagName("html")[0].className;
    if (themeClass.indexOf("light") == -1 && themeClass.indexOf("rust") == -1) {
        giscusTheme = "transparent_dark";
    }

    console.log(giscusTheme)

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://giscus.app/client.js";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.setAttribute("data-repo", "baerwang/mdbook");
    script.setAttribute("data-repo-id", "R_kgDOIzBFsg");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOIzBFss4CTshs");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-term", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");


    document.getElementById("giscus-container").appendChild(script);
};

window.addEventListener('load', giscus);

