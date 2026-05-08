import crypt from "@/utils/crypt/index";
import {isDisabled,colAuthFilter} from "@/utils/permission/index";

const _m = {
    ...crypt,
    isDisabled,
    colAuthFilter
};
export default {
    install(Vue) {
        Vue.prototype.$m = _m
    }
}
