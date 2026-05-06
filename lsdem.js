(async function() {
    function isEmptyObj(obj) {
        return isEmpty(obj?.t, sumValue, 1) && obj?.h?.every(inner => isEmpty(inner, sumValue, 0));
    }
    function isEmpty(data, func, max) {
        const sum = data?.reduce(func, 0);
        return sum <= max;
    }
    function sumValue(sum, value) {
        return sum + (Array.isArray(value) ? 0 : value);
    }
    const cKey = 'lsdem';
    async function restoreFromAStorage() {
        let cVal;
        try {
            cVal = await adenty.astorage.get(cKey);
        } catch (e) {
            cVal = null;
        }
        if(cVal && cVal.value) {
            console.log('update demeter');
            localStorage.demeter = cVal.value;
        }
    }
    const dem = localStorage.demeter;
    if(dem) {
        let decVal;
        let obj;
        try {
            decVal = adenty.tools.base64.decode(dem);
            obj = JSON.parse(decVal);
        } catch (e) {
            await restoreFromAStorage();
            return;
        }
        if(!isEmptyObj(obj)) {
            console.log('set astorage');
            adenty.astorage.set(cKey, dem).sync();
        } else {
            await restoreFromAStorage();
        }
    } else {
        await restoreFromAStorage();
    }
})();