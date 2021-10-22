<script lang="ts">
import { defineComponent, ref } from 'vue';
import WarningAmberOutlined from '@vicons/material/WarningAmberOutlined';
import OpenInNewFilled from '@vicons/material/OpenInNewFilled';
import SaveAltOutlined from '@vicons/material/SaveAltOutlined';
import FileUploadOutlined from '@vicons/material/FileUploadOutlined';
import { useStore } from '@/store';
import Warehouse from '@/components/Warehouse.vue';

export default defineComponent({
  components: {
    Warehouse,
    WarningAmberOutlined,
    OpenInNewFilled,
    SaveAltOutlined,
    FileUploadOutlined,
  },
  data() {
    const { state } = useStore();
    return {
      userData: { ...state.userData },
    };
  },
  computed: {
    pageCount() {
      return this.$store.state.pageCount;
    },
  },
  methods: {
    updateUserData(userData: Record<string, boolean>) {
      this.userData = { ...this.userData, ...userData };
    },
    saveUserData() {
      this.$store.dispatch('saveUserData', this.userData);
    },
    cleanUserData() {
      this.userData = {};
      this.$store.dispatch('saveUserData', {});
    },
  },
  setup() {
    const warehouse = ref(false);
    const exportCardInfo = () => {
      if (window.$electron?.api) {
        window.$electron.api.exportCardInfo();
      }
    };
    const importCardInfo = () => {
      if (window.$electron?.api) {
        window.$electron.api.importCardInfo();
      }
    };
    return {
      page: ref(1),
      warehouse,
      exportCardInfo,
      importCardInfo,
    };
  },
});
</script>

<template>
  <n-grid :cols="2">
    <n-gi>
      <n-space class="card-bar">
        <n-button type="info" @click="warehouse = true" >
          <template #icon>
            <open-in-new-filled />
          </template>
          九宫幻卡库
        </n-button>
      </n-space>
    </n-gi>
    <n-gi>
      <n-space class="card-bar warning" justify="end">
        <n-button-group>
          <n-button type="primary" @click="exportCardInfo" >
           <template #icon>
             <save-alt-outlined />
           </template>
           导出配置
         </n-button>
         <n-button type="warning" @click="importCardInfo" >
           <template #icon>
             <file-upload-outlined />
           </template>
           导入配置
          </n-button>
        </n-button-group>
        <n-button @click="cleanUserData" type="error" ghost>
          <template #icon>
            <warning-amber-outlined />
          </template>
          清空
        </n-button>
      </n-space>
    </n-gi>
  </n-grid>
  <n-modal
    v-model:show="warehouse"
    :mask-closable="false"
    class="card-warehouse"
    preset="card" title="九宫幻卡库"
    >
      <Warehouse :no="page" @updateUserData="updateUserData" />
      <template #footer>
        <n-space justify="space-between">
          <n-pagination class="card-pagination" v-model:page="page" :page-count="pageCount" />
          <n-button @click="saveUserData" class="card-save" type="info">保存</n-button>
        </n-space>
      </template>
  </n-modal>
</template>

<style lang="scss">
.card-bar {
  padding: 10px 15px;
}
.card-warehouse {
  width: 880px;
}
.card-pagination {
  display: inline-flex;
}
</style>
