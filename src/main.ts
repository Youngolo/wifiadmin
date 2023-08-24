import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
// import ElementPlus from "element-plus";//全局引用
import { useElementPlus } from "@/plugins/element-plus";//按需引用
import { getServerConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
import { useEcharts } from "@/plugins/echarts";
import { createApp, Directive, ref } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { injectResponsiveStorage } from "@/utils/responsive";
import { getapi, getlanlist } from "@/api/user";
import { createStore } from 'vuex';

// import Table from "@pureadmin/table";
// import PureDescriptions from "@pureadmin/descriptions";

// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

const app = createApp(App);

// 自定义指令
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册`@iconify/vue`图标库
import {
  IconifyIconOffline,
  IconifyIconOnline,
  FontIcon
} from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
app.component("Auth", Auth);

getServerConfig(app).then(async config => {
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config);
  setupStore(app);
  app.use(MotionPlugin)
    .use(useElementPlus)//按需引用
    // .use(ElementPlus)//全局引用
    .use(useEcharts);
  // .use(Table);
  // .use(PureDescriptions);
  // 创建全局变量对象
  const store = createStore({
    state() {
      return {
        Signal: {
          network_type: 'LTE',
          sub_network_type: '',
          rssi: '',
          rscp: '',
          lte_rsrp: ''
        },
        NetWork: {
          modem_main_state: "",
          pin_status: "0",
          blc_wan_mode: "AUTO",
          blc_wan_auto_mode: "AUTO_PPP",
          loginfo: "",
          fota_new_version_state: "",
          fota_current_upgrade_state: "",
          fota_upgrade_selector: "",
          network_provider: "",
          is_mandatory: "",
          sta_count: "1",
          m_sta_count: "0",
          signalbar: "4",
          network_type: "LTE",
          sub_network_type: "",
          ppp_status: "ppp_connected",
          internet_status: "",
          EX_SSID1: "Ufi_",
          sta_ip_status: "",
          EX_wifi_profile: "",
          m_ssid_enable: "",
          wifi_cur_state: "1",
          SSID1: "",
          simcard_roam: "",
          lan_ipaddr: "",
          battery_charging: "",
          battery_vol_percent: "",
          battery_pers: "",
          spn_name_data: "",
          spn_b1_flag: "",
          spn_b2_flag: "",
          realtime_tx_bytes: "",
          realtime_rx_bytes: "",
          realtime_time: "",
          realtime_tx_thrpt: "0",
          realtime_rx_thrpt: "0",
          monthly_rx_bytes: "",
          monthly_tx_bytes: "",
          traffic_alined_delta: "",
          monthly_time: "",
          date_month: "",
          data_volume_limit_switch: "",
          data_volume_limit_size: "",
          data_volume_alert_percent: "",
          data_volume_limit_unit: "",
          roam_setting_option: "",
          upg_roam_switch: "",
          fota_package_already_download: "",
          ssid: "",
          show_ssid_on_lcd: "",
          dial_mode: "",
          ethwan_mode: "",
          default_wan_name: "",
          vpn_state: "",
          connect_status: "",
          sms_received_flag: "",
          sts_received_flag: "",
          sms_unread_num: ""
        },
        NetInfo: {
          Sleep_interval: "",
          wifi_coverage: "",
          m_ssid_enable: "",
          imei: "",
          HideSSID: "",
          network_type: "LTE",
          sub_network_type: "",
          rssi: "",
          rscp: "",
          lte_rsrp: "",
          ziccid: "",
          imsi: "",
          sim_imsi: "460086103308384",
          cr_version: "XFNJ_P38_U01_MF761F_V1.0_OM_OM_ESOUND4U3_M_P001",
          hw_version: "",
          MAX_Access_num: "",
          SSID1: "",
          AuthMode: "",
          WPAPSK1_encode: "",
          m_SSID: "",
          m_AuthMode: "",
          m_HideSSID: "",
          m_WPAPSK1_encode: "",
          m_MAX_Access_num: "",
          lan_ipaddr: "",
          mac_address: "",
          msisdn: "",
          LocalDomain: "",
          wan_ipaddr: "",
          static_wan_ipaddr: "",
          ipv6_wan_ipaddr: "",
          ipv6_pdp_type: "",
          pdp_type: "",
          ppp_status: "ppp_connected",
          sta_ip_status: "",
          rj45_state: "",
          ethwan_mode: "",
          detail_cell_rsrq: "",
          detail_cell_rssi: "",
          detail_cell_pci: "",
          detail_cell_sinr: "",
          detail_cell_id: ""
        },
        LanList: [{ hostname: "", mac_addr: "" }],//有线设备列表
        WIFIList: [{//无线设备列表
          dev_type: "",
          mac_addr: "",
          hostname: "",
          ip_addr: "",
          duration: "",
          rx: "",
          tx: "",
          timestamp: "",
          ip_type: ""
        }],
        Messages: [{
          "id": "",
          "number": "",
          "content": "",
          "tag": "",
          "date": "",
          "draft_group_id": ""
        }]
      };
    },
    mutations: {
      updateSignal(state, signal) {
        state.Signal = signal;
      },
      updateNetWork(state, NetWork) {
        state.NetWork = NetWork;
      },
      updateNetInfo(state, NetInfo) {
        state.NetInfo = NetInfo;
      },
      updateLanList(state, LanList) {
        state.LanList = LanList;
      },
      updateWIFIList(state, WIFIList) {
        state.WIFIList = WIFIList;
      },
      updateMessages(state, Messages) {
        state.Messages = Messages;
      }
    },
    actions: {

    }
  });
  app.use(store);
  //创建全局定时器
  const timer = ref(null); // 用于保存定时器的引用
  // 启动定时器
  function startTimer() {
    if (timer.value === null) {
      timer.value = setInterval(() => {
        getapi('multi_data=1&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=modem_main_state%2Cpin_status%2Cblc_wan_mode%2Cblc_wan_auto_mode%2Cloginfo%2Cfota_new_version_state%2Cfota_current_upgrade_state%2Cfota_upgrade_selector%2Cnetwork_provider%2Cis_mandatory%2Csta_count%2Cm_sta_count%2Csignalbar%2Cnetwork_type%2Csub_network_type%2Cppp_status%2Cinternet_status%2CEX_SSID1%2Csta_ip_status%2CEX_wifi_profile%2Cm_ssid_enable%2Cwifi_cur_state%2CSSID1%2Csimcard_roam%2Clan_ipaddr%2Cbattery_charging%2Cbattery_vol_percent%2Cbattery_pers%2Cspn_name_data%2Cspn_b1_flag%2Cspn_b2_flag%2Crealtime_tx_bytes%2Crealtime_rx_bytes%2Crealtime_time%2Crealtime_tx_thrpt%2Crealtime_rx_thrpt%2Cmonthly_rx_bytes%2Cmonthly_tx_bytes%2Ctraffic_alined_delta%2Cmonthly_time%2Cdate_month%2Cdata_volume_limit_switch%2Cdata_volume_limit_size%2Cdata_volume_alert_percent%2Cdata_volume_limit_unit%2Croam_setting_option%2Cupg_roam_switch%2Cfota_package_already_download%2Cssid%2Cshow_ssid_on_lcd%2Cdial_mode%2Cethwan_mode%2Cdefault_wan_name%2Cvpn_state%2Cconnect_status%2Csms_received_flag%2Csts_received_flag%2Csms_unread_num', true).then(data => {
          // console.log('设备信息：', data);
          store.commit('updateNetWork', data);
          if (data.loginfo !== 'ok') {
            // 停止计时器
            // console.log(typeof stopTimer);
            if (typeof stopTimer === 'function') {
              stopTimer();
            }
            // 设置退出登录状态
            useUserStoreHook().logOut();
            console.log('设置退出登录状态');
          }
        })
        // 在这里添加计时器的逻辑
        getapi('cmd=network_type%2Csub_network_type%2Crssi%2Crscp%2Clte_rsrp&multi_data=1', true).then(data => {
          // console.log('网络信号：', data);
          if (store.state.NetWork.modem_main_state == 'modem_sim_undetected') {
            data.rssi = data.lte_rsrp = 0;
          }
          store.commit('updateSignal', data);
        })
        getlanlist().then(data => {
          // console.log('有线设备列表：', data.lan_station_list);
          store.commit('updateLanList', data.lan_station_list);
        })
        if (store.state.NetInfo.imei == '') {
          //获取设备imei信息
          getapi('cmd=wifi_coverage%2CSleep_interval%2Cm_ssid_enable%2Cimei%2Cnetwork_type%2Csub_network_type%2Crssi%2Crscp%2Clte_rsrp%2Cziccid%2Cimsi%2Csim_imsi%2Ccr_version%2Chw_version%2CMAX_Access_num%2CSSID1%2CAuthMode%2CWPAPSK1_encode%2Cm_SSID%2Cm_AuthMode%2Cm_HideSSID%2CHideSSID%2Cm_WPAPSK1_encode%2Cm_MAX_Access_num%2Clan_ipaddr%2Cmac_address%2Cmsisdn%2CLocalDomain%2Cwan_ipaddr%2Cstatic_wan_ipaddr%2Cipv6_wan_ipaddr%2Cipv6_pdp_type%2Cpdp_type%2Cppp_status%2Csta_ip_status%2Crj45_state%2Cethwan_mode%2Cdetail_cell_rsrq%2Cdetail_cell_rssi%2Cdetail_cell_pci%2Cdetail_cell_sinr%2Cdetail_cell_id&multi_data=1', true).then(data => {
            // console.log('imei信息：', data);
            if (store.state.NetWork.modem_main_state == 'modem_sim_undetected') {
              data.rssi = data.lte_rsrp = 0;
            }
            store.commit('updateNetInfo', data);
          })
        }
        getapi('cmd=sms_data_total&page=0&data_per_page=500&mem_store=1&tags=10&order_by=order+by+id+desc', true).then(data => {
          // console.log('短信列表：', data.messages);
          store.commit('updateMessages', data.messages);
        })
      }, 1000);
    }
  }
  // 停止定时器
  function stopTimer() {
    if (timer.value !== null) {
      clearInterval(timer.value);
      timer.value = null;
    }
  }
  app.provide('startTimer', startTimer);
  app.provide('stopTimer', stopTimer);

  app.mount("#app");
});