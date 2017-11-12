<template>
  <div class="container settings">
    <div class="row">
      <div class="col-md-3" role="navigation">
        <nav class="menu">
          <h3 class="menu-heading">Personal settings</h3>
          <router-link to="/settings/profile" class="menu-item" active-class="selected">Profile</router-link>
          <router-link to="/settings/account" class="menu-item" active-class="selected">Account</router-link>
        </nav>
      </div>
      <div class="col-md-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.subheading {
  display: -webkit-box;
  display: flex;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px #e1e4e8 solid;
  flex-flow: row wrap;

  h2 {
    font-size: 24px;
    font-weight: normal;
    -webkit-box-flex: 1;
    flex: 1 1 auto;
    margin-bottom: 0;
  }
}

.space {
  margin-top: 40px;
}

.settings {
  margin-top: 20px;
}

.menu {
  margin-bottom: 15px;
  background-color: rgb(255, 255, 255);
  list-style: none;
  border: 1px solid rgb(209, 213, 218);
  border-image: initial;

  .menu-heading {
    display: block;
    margin-top: 0;
    margin-bottom: 0;
    font-size: 13px;
    font-weight: 600;
    color: rgb(88, 96, 105);
    background-color: rgb(243, 245, 248);
    padding: 8px 10px;
    border-bottom: 1px solid rgb(225, 228, 232);
  }

  .menu-item {
    position: relative;
    display: block;
    padding: 8px 10px;
    border-bottom: 1px solid rgb(225, 228, 232);
    user-select: none;

    a {
      color: rgb(3, 102, 214);
      text-decoration: none;
      background-color: transparent;
    }

    a:focus,
    a:active {
      text-decoration: none;
    }
  }

  .menu-item:hover {
    background-color: rgb(246, 248, 250);
    text-decoration: none;
  }

  .menu-item:active,
  .menu-item:focus {
    text-decoration: none;
  }

  .menu-item.selected::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    content: '';
    background-color: #15569f;
  }

  .menu-item.selected {
    font-weight: 600;
    color: rgb(36, 41, 46);
    cursor: default;
    background-color: rgb(255, 255, 255);
  }

  .menu-item:last-child {
    border-bottom-right-radius: 2px;
    border-bottom-left-radius: 2px;
    border-bottom: 0;
  }
}
</style>
