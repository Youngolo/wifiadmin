import { App, Component } from "vue";
import {
  ElTag, // 标签
  ElText,//文本的常见操作
  // ElAffix, // 固钉
  // ElSkeleton, // 骨架屏
  ElBreadcrumb, // 面包屑
  ElBreadcrumbItem, // 面包屑项
  ElScrollbar, // 滚动条
  ElSubMenu, // 子菜单
  ElButton, // 按钮
  ElCol, // 列
  ElRow, // 行
  ElSpace, // 间距
  ElDivider, // 分割线
  ElCard, // 卡片
  ElDropdown, // 下拉菜单
  ElDialog, // 对话框
  ElMenu, // 菜单
  ElMenuItem, // 菜单项
  ElDropdownItem, // 下拉菜单项
  ElDropdownMenu, // 下拉菜单
  ElIcon, // 图标
  ElInput, // 输入框
  ElForm, // 表单
  ElFormItem, // 表单项
  ElPopover, // 弹出框
  ElPopper, // 弹出层
  ElTooltip, // 文字提示
  // ElDrawer, // 抽屉
  ElPagination, // 分页
  ElAlert, // 警告提示
  ElRadio, // 单选框
  ElRadioButton, // 单选按钮
  ElRadioGroup, // 单选框组
  ElDescriptions, // 描述列表
  ElDescriptionsItem, // 描述列表项
  ElBacktop, // 返回顶部
  ElSwitch, // 开关
  ElBadge, // 徽标
  ElTabs, // 标签页
  ElTabPane, // 标签页项
  ElAvatar, // 头像
  ElEmpty, // 空状态
  ElCollapse, // 折叠面板
  ElCollapseItem, // 折叠面板项
  ElTable, // 表格
  ElTableColumn, // 表格列
  // ElLink, // 链接
  // ElColorPicker, // 颜色选择器
  ElSelect, // 下拉选择框
  ElOption, // 下拉选择框项
  // ElTimeline, // 时间线
  // ElTimelineItem, // 时间线项 
  // ElResult, // 结果页
  // ElSteps, // 步骤条
  // ElStep, // 步骤条项
  // ElTree, // 树形控件
  // ElTreeV2, // 树形控件 (v2)
  ElPopconfirm, // 确认框
  ElCheckbox, // 多选框
  ElCheckboxGroup, // 多选框组
  ElLoading, // 加载指令
  ElInfiniteScroll // 无限滚动指令
} from "element-plus";

// Directives
const plugins = [ElLoading, ElInfiniteScroll];

const components = [
  ElTag, // 标签
  ElText,//文本的常见操作
  // ElAffix, // 固钉
  // ElSkeleton, // 骨架屏
  ElBreadcrumb, // 面包屑
  ElBreadcrumbItem, // 面包屑项
  ElScrollbar, // 滚动条
  ElSubMenu, // 子菜单
  ElButton, // 按钮
  ElCol, // 列
  ElRow, // 行
  ElSpace, // 间距
  ElDivider, // 分割线
  ElCard, // 卡片
  ElDropdown, // 下拉菜单
  ElDialog, // 对话框
  ElMenu, // 菜单
  ElMenuItem, // 菜单项
  ElDropdownItem, // 下拉菜单项
  ElDropdownMenu, // 下拉菜单
  ElIcon, // 图标
  ElInput, // 输入框
  ElForm, // 表单
  ElFormItem, // 表单项
  ElPopover, // 弹出框
  ElPopper, // 弹出层
  ElTooltip, // 文字提示
  // ElDrawer, // 抽屉
  ElPagination, // 分页
  ElAlert, // 警告提示
  ElRadio, // 单选框
  ElRadioButton, // 单选按钮
  ElRadioGroup, // 单选框组
  ElDescriptions, // 描述列表
  ElDescriptionsItem, // 描述列表项
  ElBacktop, // 返回顶部
  ElSwitch, // 开关
  ElBadge, // 徽标
  ElTabs, // 标签页
  ElTabPane, // 标签页项
  ElAvatar, // 头像
  ElEmpty, // 空状态
  ElCollapse, // 折叠面板
  ElCollapseItem, // 折叠面板项
  // ElTree, // 树形控件
  // ElTreeV2, // 树形控件 (v2)
  ElPopconfirm, // 确认框
  ElCheckbox, // 多选框
  ElCheckboxGroup, // 多选框组
  ElTable, // 表格
  ElTableColumn, // 表格列
  // ElLink, // 链接
  // ElColorPicker, // 颜色选择器
  ElSelect, // 下拉选择框
  ElOption, // 下拉选择框项
  // ElTimeline, // 时间线
  // ElTimelineItem, // 时间线项
  // ElResult, // 结果页
  // ElSteps, // 步骤条
  // ElStep // 步骤条项
];

export function useElementPlus(app: App) {
  // 注册组件
  components.forEach((component: Component) => {
    app.component(component.name, component);
  });
  // 注册指令
  plugins.forEach(plugin => {
    app.use(plugin);
  });
}
