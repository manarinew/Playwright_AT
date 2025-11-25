import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

//ДЗ:
//Написать тесты на сайт на каждый метод
// https://apichallenges.herokuapp.com/gui/challenges/7d9e2ef3-dfd2-48e0-ac9f-5fa97f575f7d
const apiUrl = 'https://apichallenges.eviltester.com';
let token; //токен для прогресса тестов
let taskId; // переменная для id задачи (так как в списке задач id, видимо, периодически обновляются)
let headers;
let data;

test.describe.only("Challenge", () => {
    test.beforeAll (async ({ request }) => {
        //получаем токен
        let response = await request.post(`${apiUrl}/challenger`);
        const headersForToken = response.headers();
        token = headersForToken['x-challenger'];
        headers = {'X-Challenger': token};
        console.log(`https://apichallenges.herokuapp.com/gui/challenges/${token}`);
        //получаем id для 5 теста
        response = await request.get(`${apiUrl}/todos`,{headers});
        const body = await response.json();
        taskId = body.todos[0].id;
        //создадим объект тестовых данных для создания
        data = {
            "title": faker.lorem.word(5),
            "doneStatus": false,
            "description": faker.lorem.sentence({min: 3, max: 5})
        };
    });

    test ('02. Получить список всех челленджей', async({request}) => {
        const response = await request.get(`${apiUrl}/challenges`, {headers});
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.challenges[1].status).toBe(true);
    });

    test ('03. Получить список всех тасок', async ({request}) => {
       const getResponse = await request.get(`${apiUrl}/todos`, {headers});
       const getResponseBody = await getResponse.json();
       expect(getResponse.status()).toBe(200);
       expect(getResponseBody.todos).toBeDefined();
    });

    test ('04. ')

    test ('05. Успешно получить таску по id', async({request}) => {``
        //console.log(`Номер таски ${taskId}`);
        const getResponse = await request.get(`${apiUrl}/todos/${taskId}`, {headers});
        expect(getResponse.ok()).toBeTruthy();
        //посмотрим, что имя задачи не пустое
        const body = await getResponse.json();
        expect(body.todos[0].title).not.toBe('');
        expect(getResponse.status()).toBe(200);
    });

    test ('09. Успешное создание таски', async ({request}) => {
        const response = await request.post(`${apiUrl}/todos`, {headers, data});
        const body = await response.json();
        expect(response.status()).toBe(201);
        //удостверимся, что ответный id есть и не null, 0
        expect(body.id).toBeTruthy();
        //в ответе то же самое что и в запросе
        expect(body.title).toBe(data.title);
        expect(body.description).toBe(data.description);
        expect(body.doneStatus).toBe(data.doneStatus);
        });

    test (`23. Успешное удаление таски`, async ({request}) =>{
        //создадим таску, чтобы ее затем удалить запросом
        const postResponse = await request.post(`${apiUrl}/todos`, {headers, data});
        const postResponseBody = await postResponse.json();
        const todoId = postResponseBody.id;
        //кратко проверим, что таска создалась
        expect(postResponseBody.id).toBeTruthy();
        //удаляем таску
        const deleteResponse  = await request.delete(`${apiUrl}/todos/${todoId}`, {headers});
        expect(deleteResponse.status()).toBe(200);
        //проверим, что таски нет в бд
        const getResponse = await request.get(`${apiUrl}/todos/${todoId}`, {headers});
        expect(getResponse.status()).toBe(404);
        //проверим, что в теле ответа есть сообщение об ошибке
        const getResponseBody = await getResponse.json();
        expect(getResponseBody.errorMessages).toContain(`Could not find an instance with todos/${todoId}`);
    });

    test (`16. Неуспешное обновление несуществующей таски`, async  ({request}) => {
        const getResponse = await request.get(`${apiUrl}/todos`,{headers});
        //соберем массив всех id тасок
        const getResponseBody = await getResponse.json();
        const idArray = [];
        for (let i = 0; i < getResponseBody.todos.length; i++) {
            idArray[i] = getResponseBody.todos[i].id;
        }
        const maxId = Math.max(...idArray);
        const putResponse = await request.put(`${apiUrl}/todos/${maxId+1}`, {headers, data});
        expect(putResponse.status()).toBe(400);
        const  putResponseBody = await putResponse.json();
        expect(putResponseBody.errorMessages).toContain(`Cannot create todo with PUT due to Auto fields id`);
    });
})
