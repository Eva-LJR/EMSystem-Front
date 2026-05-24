import request from '@/utils/request';
import axios from 'axios';

export function findAll() {
    return request({
        url: '/course/list',
        method: 'get'
    });
}

export function add(lecture) {
    return request({
        url: '/course',
        method: 'post',
        data: lecture
    });
}

export function update(lecture) {
    return request({
        url: '/course',
        method: 'put',
        data: lecture
    });
}

export function deleteById(id) {
    return request({
        url: '/course/' + id,
        method: 'delete'
    });
}

export function selectById(id) {
    return request({
        url: '/course/' + id,
        method: 'get'
    });
}

export function page(name, begin, end, page, pageSize) {
    return request({
        url: '/course?name='+name+'&begin='+begin+'&end='+end+'&page='+page+'&pageSize='+pageSize,
        method: 'get'
    });
}

export function bindLectureTeacher(courseId, addIds, removeIds) {
    return request({
        url: '/course/toTeacher',
        method: 'put',
        data: courseId, addIds, removeIds,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export function getRelatedTeachers(id) {
    return request({
        url: '/course/teacher/' + id,
        method: 'get',
        
    });
}