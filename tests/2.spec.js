import { test, expect } from '@playwright/test';

import { faker } from "@faker-js/faker";

//const apiUrl = 'https://realworld.qa.guru/api';

test.skip('Пользователь может зарегистрироваться используя email и пароль', async ({ request }) => {

    const user = {
        user: {
            username: faker.internet.displayName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        }
    };


    const response = await request.post('https://realworld.qa.guru/api/users', {data: user});

    // Вывод в консоль
    console.log(response.status());
    console.log(response.headers());

    //expect(response.status()).toBe(201);
    const body = await response.json();
    console.log(body);

    //expect(body).toHaveProperty('token');
    expect(body.user.token.length).toBeGreaterThan(10);
    expect(body.user.email).toBe(user.user.email);
    expect(body.user.username).toBe(user.user.username);

});

//ДЗ: почитать и разобрать что такое деструктуризация
// https://apichallenges.herokuapp.com/gui/challenges/7d9e2ef3-dfd2-48e0-ac9f-5fa97f575f7d
