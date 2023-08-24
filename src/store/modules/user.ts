import { defineStore } from "pinia";
import { store } from "@/store";
import { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageSession } from "@pureadmin/utils";
import { outLogin, postapi, refreshTokenApi } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { type DataInfo, setToken, removeToken, sessionKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username:
      storageSession().getItem<DataInfo<number>>(sessionKey)?.username ?? "",
    // 页面级别权限
    roles: storageSession().getItem<DataInfo<number>>(sessionKey)?.roles ?? []
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise((resolve, reject) => {
        postapi(data)
          .then(data => {
            if (data.result == '0') {
              //设置登录状态
              setToken(refreshTokenApi());
            }
            if (data) {
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      console.log('退出登录');
      outLogin().then(data => {
        this.username = "";
        this.roles = [];
        removeToken();//删除`token`
        useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
        resetRouter();//重置路由
        router.push("/login");
      })
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
