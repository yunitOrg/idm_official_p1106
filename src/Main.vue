<template>
    <component :is="`${componentName}`" :ref="`${componentName}`" />
</template>

<script>
export default {
    name: 'Main',
    components: {},
    data() {
        return {
            componentName: '',
        }
    },
    props: {},
    created() {
        this.login()
    },
    methods: {
        login() {
            if ( process.env.NODE_ENV == "development" ) {
                // IDM.http.post('/ctrl/login', {
                //   logName: 'kKOHPuPLig8C4W3i48lJxZ23ORxzkJxqox4TOKfAZ5YHXDBFUO0Q6WFNYD4fy/m6/Y3Lw8RYNAQSPHMeRevwsvNZA0ZZHfDU5MyF8UYFgeWmodCNWi8KfT8V390ZiP5umWgSPteAx8qIoNY9mPd9OqwC3MrzoxCCZIivot3+ZuU=',
                //   password: 'fEhM3eJ2gcIaNO4GL+Wzln/qQBqI/+juJhq8v+0uREy86l9oau+EeJAGteMZghZ2uEAErfBcccOYN76pGs7RXnzPe3c72gzJ8uRzMmzcu64f4fq1sO23MqnWJlpgl84c6/S4psaVH4vDBNAdifONlDjy2FbLMpqUaGe6UIM2TAs=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '2408141031177qWKUDWTBRG1eeDcrk9',
                //   w: '1920',
                //   h: '1032',
                //   decrypt: 'RSA',
                // })
            }
        }
    },
    mounted() {
        //这里需要把属性传递，并且把组件注册到核心框架提供的方法，然后这里接收固定的平台提供的几个方法，从而实现双向绑定刷新
        // alert(`${process.env.CodeVar}`)
        this.componentName = this.$root.componentName
        console.log(this.componentName)
    }
}
</script>

<style lang="scss">
@import './style/flex.scss';
</style>
