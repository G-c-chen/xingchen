<template>
    <div id="app">
        <router-view />
    </div>
</template>

<style lang="less">
    @import url(./common/less/reset.less);
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
    .section-inner{
        width: 900px;
        margin: 0 auto;
    }
</style>