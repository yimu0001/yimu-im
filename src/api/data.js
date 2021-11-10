import commonAxios from 'ym-bridge-shandianyun'

export const registerUser = (baseUrl) => {
  return commonAxios.request({
    url: baseUrl+'/register',
    method: 'post',
  })
}

//获取当前用户
export const getCurrentUser = (baseUrl) => {
  return commonAxios.request({
    url: baseUrl+'/current-user',
    method: 'get',
  })
}

//根据多个用户id获取用户
export const getTargetInfoById = (baseUrl, ids) => {
  return commonAxios.request({
    url: baseUrl+'/org/multi-users',
    method: 'get',
    params: {
      ids
    }
  })
}

//通过机构id获取用户
export const getUserByOrgid = (baseUrl, orgid) => {
  return commonAxios.request({
    url: baseUrl+'/org/'+orgid+'/users',
    method: 'get',
  })
}

//通过机构id获取用户
export const getOrgList = (baseUrl) => {
  return commonAxios.request({
    url: baseUrl+'/orgs',
    method: 'get',
  })
}


//创建群组
export const createGroup = (baseUrl, name, members, type = 4) => {
  return commonAxios.request({
    url: baseUrl+'/group',
    method: 'post',
    data: {
      name, members, type
    }
  })
}


//获取群组信息接口
export const groupInfos = (baseUrl, groupIds) => {
  return commonAxios.request({
    url: baseUrl+'/groupInfos',
    method: 'get',
    params: {
      groupIds
    }
  })
}

//获取群组信息接口
export const groupMembers = (baseUrl, groupIds) => {
  return commonAxios.request({
    url: baseUrl+'/group/'+groupIds+'/members',
    method: 'get',
  })
}

//群组加人接口
export const addMemberToGroup = (baseUrl, groupId, userIds) => {
  return commonAxios.request({
    url: baseUrl+'/group/'+groupId+'/member-inc',
    method: 'post',
    data: {
      members: userIds
    }
  })
}

//上传附件
export const uploadFile = (baseUrl, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return commonAxios.request({
    url: baseUrl+'/notify/upload',
    method: 'post',
    data: fd
  })
}