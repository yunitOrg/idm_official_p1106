export default {
    // 获取系统配置
    handleGetSystemSetting(key) {
        return IDM.http.getSync('/ctrl/idm/form/getSysConfigInfo', { key })
    },
    /**
    * @Desc 公文-主办部门
    * @Author hjp
    */
    async Apizhubanpart() {
        const { data } = await window.IDM.http.get('ctrl/GwWhStatistics/getDeptSelectData', {}, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 公文-文件类型
    * @Author hjp
    */
    async ApiFileType({type}) {
        const { data } = await window.IDM.http.get('ctrl/GwWhStatistics/getStatisticPageTypeData', {type: type}, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 公文-文号主办部门分布
    * @Author hjp
    */
    async Apiwenhaopart({deptId, startTime, endTime, dateRange, fileType}) {
        const { data } = await window.IDM.http.get('ctrl/GwWhStatistics/getDeptWhStatisticData', {
            deptId: deptId,
            startTime: startTime,
            endTime: endTime,
            dateRange: dateRange,
            fileType: fileType
        }, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 公文-文号办理情况统计
    * @Author hjp
    */
    async Apibanlistatic({deptId, startTime, endTime, dateRange, fileType}) {
        const { data } = await window.IDM.http.get('ctrl/GwWhStatistics/getHandlingWhStatisticData', {
            deptId: deptId,
            startTime: startTime,
            endTime: endTime,
            dateRange: dateRange,
            fileType: fileType
        }, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 公文-文号办理情况统计
    * @Author hjp
    */
    async ApiWhThreeNumData({fileType, year}) {
        const { data } = await window.IDM.http.get('ctrl/GwWhStatistics/getWhTreeNumData', {
            fileType: fileType,
            year: year,
        }, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
}