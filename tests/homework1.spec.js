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

    test ('04. Отправить запрос на неверный эндпоинт', async ({request}) => {
       const getResponse = await request.get(`${apiUrl}/todo`, {headers});
       expect(getResponse.status()).toBe(404);
    });

    test ('05. Успешно получить таску по id', async({request}) => {``
        //console.log(`Номер таски ${taskId}`);
        const getResponse = await request.get(`${apiUrl}/todos/${taskId}`, {headers});
        expect(getResponse.ok()).toBeTruthy();
        //посмотрим, что имя задачи не пустое
        const body = await getResponse.json();
        expect(body.todos[0].title).not.toBe('');
        expect(getResponse.status()).toBe(200);
    });

    test ('06. Неуспешное получение несуществующей таски', async ({request}) => {
        //соберем массив всех id тасок
        const getResponseAll = await request.get(`${apiUrl}/todos`, {headers});
        const getResponseBody = await getResponseAll.json();
        const idArray = [];
        for (let i = 0; i < getResponseBody.todos.length; i++) {
            idArray[i] = getResponseBody.todos[i].id;
        }
        const maxId = Math.max(...idArray);
        const getResponse = await request.get(`${apiUrl}/todos/${maxId+1}`, {headers});
        expect(getResponse.status()).toBe(404);
    });

    test('07. Получить выполненные таски', async ({request}) => {
        //тесты гоняются не по порядку, 58 челлендж может стартануть раньше и удалить все таски в базе
        //создадим таску со статусом true post-запросом, чтобы точно пройти тест
        //переопределим doneStatus в рамках этого теста
        const dataWithDoneStatusTrue = {...data, doneStatus: true};
        const postResponse = await request.post(`${apiUrl}/todos`, {headers, data: dataWithDoneStatusTrue});
        expect(postResponse.ok()).toBeTruthy();
        const getResponse = await request.get(`${apiUrl}/todos?doneStatus=true`, {headers});
        expect(getResponse.status()).toBe(200);
        const getResponseBody = await getResponse.json();
        //проверим, что ответный массив метода не пустой
        const todos = getResponseBody.todos;
        expect(todos.length).toBeGreaterThan(0);
        //проверка, что фильтр сработал верно
        for (const i of todos){
            expect(i.doneStatus).toBe(true);
        }
    });

    test('08. Успешно получить ответные заголовки', async ({request}) => {
       const headResponse = await request.head(`${apiUrl}/todos`, {headers});
       const headResponseBody = headResponse.headers();
       expect(headResponseBody['x-challenger']).toBe(token);
       expect(headResponse.status()).toBe(200);
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

    test ('10. Неуспешное создание таски с неправильным статусом', async ({request}) => {
        const dataWithInvalidStatus = {...data, doneStatus: 'invalid'};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers,
            data: dataWithInvalidStatus
        });
        const postResponseBody = await postResponse.json();
        expect(postResponse.status()).toBe(400);
        expect(postResponseBody.errorMessages[0]).toBe('Failed Validation: doneStatus should be BOOLEAN but was STRING');
    });

    test ('11. Неуспешное создание таски с слишком большой длиной имени', async ({request}) => {
       const failedPostData = {...data, title : faker.lorem.sentence({min : 51, max: 100})};
       const postResponse = await request.post(`${apiUrl}/todos`, {headers, data: failedPostData});
       const postResponseBody = await postResponse.json();
       expect(postResponse.status()).toBe(400);
       expect(postResponseBody.errorMessages[0]).toBe('Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50');
    });

    test ('12. Неуспешное создание таски с слишком большой длиной описания', async ({request}) => {
        const failedPostData = {...data, description : faker.lorem.sentence({min : 201, max: 250})};
        const postResponse = await request.post(`${apiUrl}/todos`, {headers, data: failedPostData});
        const postResponseBody = await postResponse.json();
        expect(postResponse.status()).toBe(400);
        expect(postResponseBody.errorMessages[0]).toBe('Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200');
    });

    test ('13. Успешное создание таски с макс. длиной имени и описания', async ({request}) => {
        const postData = {...data, title: faker.string.alpha({length: 50}), description : faker.string.alpha({length: 200})};
        const postResponse = await request.post(`${apiUrl}/todos`, {headers, data: postData});
        const postResponseBody = await postResponse.json();
        expect(postResponse.status()).toBe(201);
        // id пришел в ответе, он число и не null
        expect(postResponseBody.id).toBeDefined();
        expect(typeof postResponseBody.id).toBe('number');
        expect(postResponseBody.title).toBe(postData.title);
        expect(postResponseBody.id).not.toBeNull();
        // doneStatus пришел в ответе, он bool и не null
        expect(postResponseBody.doneStatus).toBeDefined();
        expect(typeof postResponseBody.doneStatus).toBe('boolean');
        expect(postResponseBody.doneStatus).not.toBeNull();
        expect(postResponseBody.description).toBe(postData.description);

    });

    test ('14. Неуспешное создание таски с слишком большим телом запроса', async ({request}) => {
        const failedPostData = {...data, description : faker.string.alpha({length: 5000})};
        const postResponse = await request.post(`${apiUrl}/todos`, {headers, data: failedPostData});
        const postResponseBody = await postResponse.json();
        expect(postResponse.status()).toBe(413);
        expect(postResponseBody.errorMessages[0]).toBe('Error: Request body too large, max allowed is 5000 bytes');
    });

    test ('15. Неуспешное создание таски с неизвестным полем в теле запроса', async ({request}) => {
        const dataWithUnexpectedField = {...data, surpriseField: 'Surprise Surpriiiise!'};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers,
            data: dataWithUnexpectedField
        });
        const postResponseBody = await postResponse.json();
        expect(postResponse.status()).toBe(400);
        expect(postResponseBody.errorMessages[0]).toBe('Could not find field: surpriseField');

    })

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
})
