import { test, expect } from '@playwright/test';
import { faker } from "@faker-js/faker";

//ДЗ:
//Написать тесты на сайт на каждый метод
// https://apichallenges.herokuapp.com/gui/challenges/7d9e2ef3-dfd2-48e0-ac9f-5fa97f575f7d
const apiUrl = 'https://apichallenges.eviltester.com'
let token;

test.describe("Challenge", () => {
    test.beforeAll(async ({ request }) => {
        const response = await request.post(`${apiUrl}/challenger`);
        const headers = response.headers();
        token = headers['x-challenger'];
        console.log(`!!тут ссылку с токеном вставить!!`);
    });

const apiUrl = 'https://realworld.qa.guru/api';

test('Пользователь может зарегистрироваться используя email и пароль', async ({ request }) => {
    const response = await request.post(`${apiUrl}/challenges`, {
        headers:{
            'x-challenger': token
        }
    });
    const body = await response.json();
    expect(body.challenges.length).toBe(59);

});
})
