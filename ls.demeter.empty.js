(async function() {
    function isEmptyObj(obj) {
        return isEmpty(obj?.t, sumValue, 1) && obj?.h?.every(inner => isEmpty(inner, sumValue, 0)) &&
            isEmpty(obj?.t, sumLen, 1) && obj?.h?.every(inner => isEmpty(inner, sumLen, 0));
    }
    function isEmpty(data, func, max) {
        const sum = data?.reduce(func, 0);
        return sum <= max;
    }
    function sumLen(sum, value) {
        return sum + (Array.isArray(value) ? value.length : 0);
    }
    function sumValue(sum, value) {
        return sum + (Array.isArray(value) ? 0 : value);
    }
    const cKey = 'lsdem';
    async function restoreFromSCookie() {
        let cVal;
        try {
            cVal = await adenty.scookie.get(cKey);
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
            await restoreFromSCookie();
            return;
        }
        if(!isEmptyObj(obj)) {
            adenty.scookie.set({"name" : cKey, "value" : dem});
            console.log('set cookie');
        } else {
            await restoreFromSCookie();
        }
    } else {
        await restoreFromSCookie();
    }
})();