---
title: 第134课：表格和表单
description: 表格数据展示、CRUD 操作、表单验证、搜索筛选
date: 2026-08-06
tags:
  - Vue3
  - 表格
  - 表单
  - CRUD
  - Element Plus
  - 数据展示
---

# 表格和表单

## 学习目标

- 掌握表格的 CRUD 操作
- 掌握搜索筛选的实现
- 掌握表单的自定义验证
- 掌握批量操作

---

## 搜索表单

```vue
<template>
  <div class="search-form">
    <el-form :model="queryParams" inline>
      <el-form-item label="用户名">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="角色">
        <el-select
          v-model="queryParams.role"
          placeholder="请选择"
          clearable
        >
          <el-option label="管理员" value="admin" />
          <el-option label="编辑" value="editor" />
          <el-option label="访客" value="viewer" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择"
          clearable
        >
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## 表格 CRUD

```vue
<template>
  <div class="table-page">
    <!-- 搜索表单 -->
    <SearchForm @search="fetchData" @reset="handleReset" />

    <!-- 操作按钮 -->
    <div class="table-operations">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon> 新增
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon> 批量删除
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <!-- 其他列 -->
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link @click="handleDetail(row)">详情</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="fetchData"
    />

    <!-- 新增/编辑对话框 -->
    <UserDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :form-data="currentRow"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getUserList, deleteUser, batchDeleteUser } from '@/api/user';
import SearchForm from './components/SearchForm.vue';
import UserDialog from './components/UserDialog.vue';

const loading = ref(false);
const tableData = ref<User[]>([]);
const total = ref(0);
const selectedIds = ref<number[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<'create' | 'edit'>('create');
const currentRow = ref<User | null>(null);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  username: '',
  role: '',
  status: '',
  dateRange: [] as string[]
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getUserList(queryParams);
    tableData.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

// CRUD 操作
const handleCreate = () => {
  dialogType.value = 'create';
  currentRow.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row: User) => {
  dialogType.value = 'edit';
  currentRow.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: User) => {
  await deleteUser(row.id);
  ElMessage.success('删除成功');
  fetchData();
};

const handleBatchDelete = async () => {
  await batchDeleteUser(selectedIds.value);
  ElMessage.success('批量删除成功');
  fetchData();
};

onMounted(() => fetchData());
</script>
```

---

## 表单组件封装

```vue
<!-- UserDialog.vue -->
<template>
  <el-dialog
    :model-value="visible"
    :title="type === 'create' ? '新增用户' : '编辑用户'"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="formData.role">
          <el-option label="管理员" value="admin" />
          <el-option label="编辑" value="editor" />
          <el-option label="访客" value="viewer" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { createUser, updateUser } from '@/api/user';
import type { FormInstance } from 'element-plus';

const props = defineProps<{
  visible: boolean;
  type: 'create' | 'edit';
  formData: User | null;
}>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  role: 'viewer'
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

watch(() => props.formData, (val) => {
  if (val) Object.assign(formData, val);
}, { immediate: true });

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (props.type === 'create') {
      await createUser(formData);
    } else {
      await updateUser(props.formData!.id, formData);
    }
    ElMessage.success('操作成功');
    emit('success');
    emit('update:visible', false);
  } finally {
    submitLoading.value = false;
  }
};
</script>
```

---

## 自测题

### 问题 1
搜索表单的查询参数和分页参数应该如何管理？

<details>
<summary>查看答案</summary>
搜索参数和分页参数统一在一个对象（queryParams）中管理，包括 page、pageSize 以及搜索条件。搜索操作重置 page 为 1 后发请求。分页变化保持搜索条件不变，只更新 page 或 pageSize。这样可以保证搜索和分页的正确交互。搜索参数变化时通常需要重置到第一页，因为当前页可能已经不存在了。
</details>

### 问题 2
批量删除操作如何设计用户体验？

<details>
<summary>查看答案</summary>
1）使用表格的 selection 列让用户多选；2）批量操作按钮在未选择时 disabled；3）点击批量删除后显示确认弹窗（ElMessageBox.confirm 或 el-popconfirm）；4）删除成功后显示成功提示；5）清空选中状态；6）重新加载数据（保持当前页码）；7）如果当前页数据全部删除，自动切换到上一页。
</details>

### 问题 3
表单弹窗（Dialog）如何复用新增和编辑功能？

<details>
<summary>查看答案</summary>
通过 type 属性区分新增/编辑模式：1）新增模式：弹窗标题显示"新增"，表单数据初始化为空；2）编辑模式：弹窗标题显示"编辑"，通过 watch 监听 formData prop 填充表单数据。提交时根据 type 调用不同的 API。新增和编辑共用相同的表单验证规则和 UI 布局，使用 v-model:visible 控制显隐，通过 @success 事件通知父组件刷新数据。
</details>