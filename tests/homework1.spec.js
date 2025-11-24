import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

//ДЗ:
//Написать тесты на сайт на каждый метод
// https://apichallenges.herokuapp.com/gui/challenges/7d9e2ef3-dfd2-48e0-ac9f-5fa97f575f7d
const apiUrl = 'https://apichallenges.eviltester.com';
let token; //токен для прогресса тестов
let taskId; // переменная для id задачи (так как в списке задач id видимо периодически обновляются)
let headers;

test.describe.only("Challenge", () => {
    //получаем токен
    test.beforeAll (async ({ request }) => {
        let response = await request.post(`${apiUrl}/challenger`);
        const headersForToken = response.headers();
        token = headersForToken['x-challenger'];
        headers = {'X-Challenger': token};
        console.log(`https://apichallenges.herokuapp.com/gui/challenges/${token}`);
        //получаем id для 5 теста
        response = await request.get(`${apiUrl}/todos`,{headers});
        const body = await response.json();
        taskId = body.todos[0].id;
    });

    test ('02. Получить список всех челленджей', async({request}) => {
        const response = await request.get(`${apiUrl}/challenges`, {headers});
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.challenges[1].status).toBe(true);
    });

    test ('05. Успешно получить таску по id', async({request}) => {
        console.log(`Номер таски ${taskId}`);
        const response = await request.get(`${apiUrl}/todos/${taskId}`, {headers});
        expect(response.ok()).toBeTruthy();
        //посмотрим, что имя задачи не пустое
        const body = await response.json();
        expect(body.todos[0].title).not.toBe('');
    });

    test('09. Успешное создание таски', async ({request}) => {
        const data = {
            "title": faker.lorem.word(5),
                "doneStatus": false,
                "description": faker.lorem.sentence({min: 3, max: 5})
        }
    const response = await request.post(`${apiUrl}/todos`, {headers}, {data});
    console.log(data);
    })
})
