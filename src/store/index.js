import { createStore } from "vuex";

const store = createStore({
  state: {
    isLoggedIn: false, // 登录状态
    userId: null, // 当前登录用户的 ID
    showAuthModal: false, // 是否显示注册弹窗
  },
  mutations: {
    setLoginState(state, { isLoggedIn, userId }) {
      state.isLoggedIn = isLoggedIn;
      state.userId = userId;
    },
    setShowAuthModal(state, show) {
      state.showAuthModal = show;
    },
  },
  actions: {
    login({ commit }, userId) {
      commit("setLoginState", { isLoggedIn: true, userId });
      commit("setShowAuthModal", false); // 登录成功后关闭弹窗
    },
    logout({ commit }) {
      commit("setLoginState", { isLoggedIn: false, userId: null });
    },
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    userId: (state) => state.userId,
    showAuthModal: (state) => state.showAuthModal,
  },
});

export default store;