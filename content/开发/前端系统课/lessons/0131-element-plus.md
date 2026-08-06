---
title: 第131课：Element Plus
description: Element Plus 组件库集成、表单、表格、弹窗等常用组件
date: 2026-08-06
tags:
  - Vue3
  - Element Plus
  - 组件库
  - 表单
  - 表格
---

# Element Plus

## 学习目标

- 掌握 Element Plus 常用组件的使用
- 掌握表单验证和表格功能
- 掌握弹窗和通知的使用
- 理解组件二次封装的方法

---

## 表单

### 基础表单

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
    size="default"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input
        v-model="formData.password"
        type="password"
        show-password
        placeholder="请输入密码"
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" placeholder="请输入邮箱" />
    </el-form-item>

    <el-form-item label="角色" prop="role">
      <el-select v-model="formData.role" placeholder="请选择角色">
        <el-option label="管理员" value="admin" />
        <el-option label="编辑" value="editor" />
        <el-option label="访客" value="viewer" />
      </el-select>
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-switch v-model="formData.status" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

interface FormData {
  username: string;
  password: string;
  email: string;
  role: string;
  status: boolean;
}

const formRef = ref<FormInstance>();
const formData = reactive<FormData>({
  username: '',
  password: '',
  email: '',
  role: '',
  status: true
});

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    console.log('提交数据:', formData);
  } catch (error) {
    console.error('验证失败:', error);
  }
};

const handleReset = () => {
  formRef.value?.resetFields();
};
</script>
```

---

## 表格

### 基础表格

```vue
<template>
  <el-table
    :data="tableData"
    border
    stripe
    style="width: 100%"
    v-loading="loading"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="username" label="用户名" min-width="120" />
    <el-table-column prop="email" label="邮箱" min-width="180" />
    <el-table-column prop="role" label="角色" width="100">
      <template #default="{ row }">
        <el-tag :type="roleType(row.role)">
          {{ roleLabel(row.role) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'info'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" width="180" />
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
```

---

## 弹窗和抽屉

```vue
<template>
  <!-- 对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'create' ? '新增用户' : '编辑用户'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form>...</el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>

  <!-- 抽屉 -->
  <el-drawer
    v-model="drawerVisible"
    title="用户详情"
    size="500px"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>
```

---

## 通知和消息

```typescript
// 成功提示
ElMessage.success('操作成功');
ElMessage({ type: 'success', message: '保存成功' });

// 错误提示
ElMessage.error('操作失败');
ElMessage({ type: 'error', message: '网络异常', duration: 5000 });

// 确认对话框
ElMessageBox.confirm('确定要删除吗？', '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning'
}).then(() => {
  // 确认操作
}).catch(() => {
  // 取消操作
});

// 通知
ElNotification({
  title: '系统通知',
  message: '有新的待办事项',
  type: 'info',
  duration: 3000
});
```

---

## 自测题

### 问题 1
Element Plus 表单验证的 trigger 属性（blur/change）分别在什么情况下触发？

<details>
<summary>查看答案</summary>
blur 在输入框失去焦点时触发验证，适合输入型组件（input、textarea）。change 在值变化时触发验证，适合选择型组件（select、radio、checkbox）。通常输入框使用 blur，选择框使用 change。也可以同时设置 ['blur', 'change'] 两种都触发。
</details>

### 问题 2
Element Plus 表格的 slot 用法有哪些？

<details>
<summary>查看答案</summary>
常用的 slot：1）default（默认）：表体单元格内容，通过 { row, column, $index } 访问数据；2）header：表头单元格内容；3）append：表格最后追加内容；4）empty：空数据时显示内容；5）expand：展开行内容。最常见的 #default="{ row }" 用于自定义列内容，如状态标签、操作按钮等。
</details>

### 问题 3
ElMessageBox.confirm 返回的是什么？如何处理用户的操作？

<details>
<summary>查看答案</summary>
返回一个 Promise。用户点击"确认"时 Promise resolve，点击"取消"或关闭时 Promise reject。使用 .then() 处理确认操作，.catch() 处理取消操作（注意区分真正的错误和取消）。也可以使用 async/await 配合 try/catch 处理。
</details>