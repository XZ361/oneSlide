const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)
const convert = raw => {
    let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s != '').map(s => s.trim())
    html = ''
    for (let i = 0; i < arr.length; i++) {
        if (arr[i + 1] !== undefined) {
            if (isMain(arr[i]) && isMain(arr[i + 1])) {
                html += `
                    <section data-markdown>
                    <textarea data-template>
                        ${arr[i]}
                    </textarea>
                </section>
                    `
            } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
                html += `
                <section>
                        <section data-markdown>
                    <textarea data-template>
                        ${arr[i]}
                    </textarea>
                </section>
                `
            } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
                html += `
                    <section data-markdown>
                <textarea data-template>
                    ${arr[i]}
                </textarea>
            </section>
                    `
            } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
                html += `
                    <section data-markdown>
                    <textarea data-template>
                        ${arr[i]}
                    </textarea>
                </section>
            </section>
                    `
            }

        } else {
            if (isMain(arr[i])) {
                html += `
                    <section data-markdown>
                <textarea data-template>
                    ${arr[i]}
                </textarea>
            </section>`
            } else if (isSub(arr[i])) {
                html += `
                    <section data-markdown>
                    <textarea data-template>
                        ${arr[i]}
                    </textarea>
                </section>
            </section>
                    `
            }
        }
    }
    return html
}


/*通过模块化的开发方式，封装各个模块，实现代码的可复用性*/
// 按钮模块
const Menu = {
        // 封装menu模块
        init() {
            console.log('Menu init...')
                // 打开菜单栏按钮
            this.$settintIcon = $('.control .icon-setting')
                // 菜单栏功能
            this.$menu = $('.menu')
                // 菜单栏关闭按钮
            this.$closeIcon = $('.menu .icon-close')
                // $$tabs,$$contents是类数组对象
            this.$$tabs = $$('.menu .tab')
            this.$$contents = $$('.menu .content')

            this.bind()
        },
        // 绑定事件
        bind() {
            // 当前this指向Menu模块,可以用let self = this解决，或者箭头函数也可以解决this的指向性问题
            this.$settintIcon.onclick = () => {
                // 注意当前this代表被点击的图标
                this.$menu.classList.add('open')
            }
            this.$closeIcon.onclick = () => {
                this.$menu.classList.remove('open')
            }
            this.$$tabs.forEach($tab => $tab.onclick = () => {
                // 当点击对应的tab时，将所有tab的class=active去掉，给当前被点击的tab加上active
                this.$$tabs.forEach($node => $node.classList.remove('active'))
                $tab.classList.add('active')
                    // 下一步需要展示当前被点击tab所对应的content
                    // 即需要获取被点击tab的index
                let index = [...this.$$tabs].indexOf($tab)
                this.$$contents.forEach($node => $node.classList.remove('active'))
                this.$$contents[index].classList.add('active')
            })
        }
    }
    // 集成上传文件模块
const ImgUploader = {
        init() {

            this.$fileInput = $('#img-uploader')
            this.$textarea = $('.editor textarea')
            AV.init({
                appId: "xl5PtXUU3LluVijMH2eF4X9C-gzGzoHsz",
                appKey: "hvdyKoPL9MSbM5o2S9WGFTxW",
                serverURL: "https://xl5ptxuu.lc-cn-n1-shared.com"
            });
            this.bind()
        },
        bind() {
            let self = this
            this.$fileInput.onchange = function() {
                if (this.files.length > 0) {
                    let localFile = this.files[0]
                    console.log(localFile)
                    if (localFile.size / 1048576 > 2) {
                        alert('文件不能超过2M')
                        return
                    }
                    // 		上传之前
                    self.insertText(`![上传中，进度${percent=0}%]()`)
                    const avFile = new AV.File(encodeURI(localFile.name), localFile);

                    avFile.save({
                        keepFileName: true,
                        onprogress: (progress) => {
                            self.insertText(`![上传中，进度${progress.percent}%]()`)
                        }
                    }).then(file => {
                        console.log('文件保存完成');
                        console.log(file)
                            // 	上传完成后
                        let text = `![${file.attributes.name}}](${file.attributes.url}?imageView2/0/w/800/h/400)`
                        self.insertText(text)

                    }, (error) => {
                        // 保存失败，可能是文件无法被读取，或者上传过程中出现问题
                        console.log(error)
                    });
                }


            }
        },
        insertText(text = '') {
            let $textarea = this.$textarea
            let start = $textarea.selectionStart
            let end = $textarea.selectionEnd
            let oldText = $textarea.value

            let insertText = text

            $textarea.value = `${oldText.substring(0,start)}${insertText} ${oldText.substring(end)}`
            $textarea.focus()
            $textarea.setSelectionRange(start, start + insertText.length)
        }
    }
    // 编辑器模块
const Editor = {
    init() {
        console.log('Editor init...')
        this.$editInput = $('.editor textarea')
        this.$saveBtn = $('.editor .button-save')
        this.$slideContainer = $('.slides')
            // 第一次加载时，为markdown设置默认值
        this.markdown = localStorage.markdown || `# one slide`

        this.bind()
        this.start()
    },
    bind() {
        this.$saveBtn.onclick = () => {
            // 将用户修改的内容保存在本地中
            localStorage.markdown = this.$editInput.value
                // 用户修改并保存后，页面重新加载
            location.reload()
        }
    },
    // 页面加载时调用start函数
    start() {
        // 将修改后的内容保存在edit输入框中，便于下次浏览查看
        this.$editInput.value = this.markdown
            // 将修改后的内容，绑定到对应的dom上渲染
        this.$slideContainer.innerHTML = convert(this.markdown)

        Reveal.initialize({
            controls: true,
            progress: true,
            center: localStorage.align === 'left-top' ? false : true,
            hash: true,

            transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom

            // More info https://github.com/hakimel/reveal.js#dependencies
            dependencies: [{
                src: 'plugin/markdown/marked.js',
                condition: function() {
                    return !!document.querySelector('[data-markdown]');
                }
            }, {
                src: 'plugin/markdown/markdown.js',
                condition: function() {
                    return !!document.querySelector('[data-markdown]');
                }
            }, {
                src: 'plugin/highlight/highlight.js'
            }, {
                src: 'plugin/search/search.js',
                async: true
            }, {
                src: 'plugin/zoom-js/zoom.js',
                async: true
            }, {
                src: 'plugin/notes/notes.js',
                async: true
            }]
        });
    }
}

// 页面主题的功能逻辑
const Theme = {
    init() {
        this.$$figures = $$('.themes figure')
        this.$transition = $('.theme .transition')
        this.$align = $('.theme .align')
        this.$reveal = $('.reveal')

        this.bind()
        this.loadTheme()
    },
    bind() {
        this.$$figures.forEach($figure => $figure.onclick = () => {
            // 点击时，将所有的主题做个遍历，去掉选中状态,并给当前被点击的主题加上选中状态
            this.$$figures.forEach($node => $node.classList.remove('select'))
            $figure.classList.add('select')

            // 可以通过当前对象的dataset.xxx属性获取到自定义的所有属性;如data-xxx=''
            this.setTheme($figure.dataset.theme)
        })

        // 转场特效的功能逻辑代码
        this.$transition.onchange = function() {
            // 将选中的专场保存在本地中，页面刷新
            localStorage.transition = this.value
            location.reload()
        }
        this.$align.onchange = function() {
            // 将选中的对齐属性保存在本地
            localStorage.align = this.value
            location.reload()
        }
    },
    setTheme(theme) {
        // 将主题存在本地，等待页面刷新时，更换主题
        localStorage.theme = theme
        location.reload()
    },
    loadTheme() {
        let theme = localStorage.theme || 'beige'

        let $link = document.createElement('link')
        $link.rel = 'stylesheet'
        $link.href = `css/theme/${theme}.css`
        document.head.appendChild($link)
            // $(`select figure[data-theme=${theme}]`)
            // 找到当前被点击的theme,给他加上select类
            // 建构了类数组对象转化成数组，之后调用数组的find方法过滤出被点击的figure
        Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
        this.$transition.value = localStorage.transition || 'slide'
        this.$align.value = localStorage.align || 'center'

        this.$reveal.classList.add(this.$align.value)
    }
}


// 下载pdf功能模块
const Print = {
    init() {
        this.$download = $('.download')

        this.bind()
        this.start()
    },
    bind() {
        this.$download.addEventListener('click', () => {
            let $link = document.createElement('a')
            $link.setAttribute('target', '_blank')
                // +表示出现1次或多次，这样会导致刚进来时下载pdf无效
                // $link.setAttribute('href', location.href.replace(/#\/.+/, '?print-pdf'))
                // *表示0次或多次
            $link.setAttribute('href', location.href.replace(/#\/.*/, '?print-pdf'))
            $link.click()
        })
    },
    start() {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        if (window.location.search.match(/print-pdf/gi)) {
            link.href = 'css/print/pdf.css'
            window.print()
        } else {
            link.href = 'css/print/paper.css'
        }
        document.head.appendChild(link);
    }
}

// 代表页面的功能
const App = {
    init() {
        [...arguments].forEach(Module => Module.init())
    }
}

// 页面所有功能的总入口，页面初始化,依次加载各个功能模块
App.init(
    Menu,
    ImgUploader,
    Editor,
    Theme,
    Print
)