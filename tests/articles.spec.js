import { test, expect } from '@playwright/test';

const apiUrl = 'https://realworld.qa.guru/api';

test('Неавторизованный пользователь может получить список статей', async ({ request }) => {
    const response = await request.get('https://realworld.qa.guru/api/articles');
    expect(response.status()).toBe(200);
});

test('Неавторизованный пользователь может получить список статей с пагинацией', async ({ request }) => {
    const response = await request.get('https://realworld.qa.guru/api/articles?limit=3&&offset=0');
    expect(response.status()).toBe(200);
    console.log(response.headers());
    console.log(response.body());
    expect (response.headers().server).toBe('nginx');
});
