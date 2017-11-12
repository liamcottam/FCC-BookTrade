<template>
  <div id="app">
    <Navbar></Navbar>
    <keep-alive include="home,add-book">
      <router-view></router-view>
    </keep-alive>
    <div class="container">
      <footer class="page-footer">
        <div class="footer-container text-center">
          <a :href="`https://github.com/liamcottam/FCC-${$appName}`" target="_blank"><span class="fa fa-github"></span> Source Code</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar';

export default {
  components: { Navbar },
};
</script>
