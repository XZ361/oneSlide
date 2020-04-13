const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)
const convert = raw => {
    let arr = raw.split(/\n(?=\s*#)/).filter(s => s != '').map(s => s.trim())
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
                center: true,
                hash: true,

                transition: 'slide', // none/fade/slide/convex/concave/zoom

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
    // 代表页面的功能
const App = {
    init() {
        [...arguments].forEach(Module => Module.init())
    }
}

// 页面所有功能的总入口，页面初始化
App.init(
    Menu,
    Editor
)