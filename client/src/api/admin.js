import request from '@/utils/request'

export default {
    getUserList(listName, skip = 0, filter = {}) {
        return request({
            url: `/api/v1/admin/${listName.toLowerCase()}`,
            method: 'get',
            params: { skip, filter },
        })
    },
    addRole(username, role) {
        return request({
            url: `/api/v1/users/${username}/roles`,
            method: 'put',
            data: { role },
        })
    },
    removeRole(username, role) {
        return request({
            url: `/api/v1/users/${username}/roles`,
            method: 'delete',
            data: { role },
        })
    },
}
