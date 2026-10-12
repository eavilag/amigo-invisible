import { claimViaUi, createGroupViaUi, drawViaUi, expect, newPhone, test } from './support';

test.describe('Participante', () => {
  test('CP-E-10 [RF-07][RF-08][RF-09][RF-11][RNF-03][RNF-14][CA-07.1][CA-08.1][CA-09.1] una persona mayor ve a quién regala en 3 toques y el móvil la recuerda', async ({
    page,
    browser,
  }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Navidad', ['Carmen', 'Abuelo Paco', 'Abuela Rosa'], { budget: '20 €' });
    await drawViaUi(page);

    const { context, phone } = await newPhone(browser, page);
    let taps = await claimViaUi(phone, groupUrl, 'Abuelo Paco');
    await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
    taps++;
    expect(taps).toBeLessThanOrEqual(3);
    await expect(phone.getByRole('heading', { level: 1, name: 'Te ha tocado regalar a' })).toBeVisible();
    const receiver = (await phone.getByTestId('receiver-name').textContent())!;
    expect(['Carmen', 'Abuela Rosa']).toContain(receiver);
    await expect(phone.getByText('20 €')).toBeVisible();
    await expect(phone.getByText('Todavía no ha escrito ideas.')).toBeVisible();

    // Otro día: el mismo enlace lleva directamente a su pantalla.
    await phone.goto(groupUrl);
    await expect(phone.getByRole('heading', { level: 1, name: 'Hola, Abuelo Paco' })).toBeVisible();
    // Volver con el botón del sistema funciona (navegación sencilla).
    await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
    await phone.goBack();
    await expect(phone.getByRole('heading', { level: 1, name: 'Hola, Abuelo Paco' })).toBeVisible();
    await context.close();
  });

  test('CP-E-11 [RF-07][CA-07.2][CA-07.3][CA-07.6] decir "No" no cambia nada y un nombre ocupado lo explica', async ({ page, browser }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Ocupado', ['Carmen', 'Paco', 'Rosa']);
    const { context, phone } = await newPhone(browser, page);
    await phone.goto(groupUrl);
    await phone.getByRole('button', { name: 'Carmen', exact: true }).click();
    await phone.getByRole('dialog', { name: '¿Eres Carmen?' }).getByRole('button', { name: 'No' }).click();
    await expect(phone.getByRole('heading', { name: '¿Quién eres tú? Toca tu nombre' })).toBeVisible();

    const { context: c2, phone: other } = await newPhone(browser, page);
    await claimViaUi(other, groupUrl, 'Carmen');

    await phone.reload();
    const taken = phone.getByRole('button', { name: /Carmen.*Ya ha entrado/ });
    await expect(taken).toBeVisible();
    await taken.click();
    const info = phone.getByRole('dialog', { name: 'Carmen ya ha entrado' });
    await expect(info).toContainText('pide a quien organiza que te deje entrar de nuevo');
    await info.getByRole('button', { name: 'Entendido' }).click();
    await context.close();
    await c2.close();
  });

  test('CP-E-12 [RF-09][RF-10][RF-11][CA-09.2][CA-10.1][CA-10.2][CA-10.4][CA-11.1][CA-11.3] las ideas se escriben antes del sorteo y quien regala ve siempre la última versión', async ({
    page,
    browser,
  }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Ideas', ['Ana', 'Luis', 'Eva']);
    const phones = await Promise.all(['Ana', 'Luis', 'Eva'].map(() => newPhone(browser, page)));
    const names = ['Ana', 'Luis', 'Eva'];
    for (const [i, { phone }] of phones.entries()) {
      await claimViaUi(phone, groupUrl, names[i]!);
      await expect(phone.getByText('Todavía no se ha hecho el sorteo.')).toBeVisible();
      await phone.getByRole('link', { name: 'Escribir mis ideas' }).click();
      const box = phone.getByLabel('¿Qué te gustaría?');
      await box.fill(`Ideas de ${names[i]}`);
      await expect(phone.getByText(`${`Ideas de ${names[i]}`.length} de 500 letras`)).toBeVisible();
      await phone.getByRole('button', { name: 'Guardar' }).click();
      await expect(phone.getByRole('status')).toContainText('Guardado');
      await expect(phone.getByText(`Ideas de ${names[i]}`)).toBeVisible();
    }
    await expect(phones[0]!.phone.getByLabel('¿Qué te gustaría?')).toHaveCount(0);

    await drawViaUi(page);
    const receivers = new Map<string, string>();
    for (const [i, { phone }] of phones.entries()) {
      await phone.reload();
      await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
      const receiver = (await phone.getByTestId('receiver-name').textContent())!;
      receivers.set(names[i]!, receiver);
      await expect(phone.getByText(`Ideas de ${receiver}`, { exact: true }).last()).toBeVisible();
    }

    // Eva cambia sus ideas después del sorteo; quien le regala ve el cambio.
    const evaPhone = phones[2]!.phone;
    await evaPhone.goto(groupUrl);
    await evaPhone.getByRole('link', { name: 'Cambiar mis ideas' }).click();
    await evaPhone.getByLabel('¿Qué te gustaría?').fill('Zapatillas de casa talla 38');
    await evaPhone.getByRole('button', { name: 'Guardar' }).click();
    const giverOfEva = [...receivers].find(([, r]) => r === 'Eva')![0];
    const giverPhone = phones[names.indexOf(giverOfEva)]!.phone;
    await giverPhone.reload();
    await expect(giverPhone.getByText('Zapatillas de casa talla 38')).toBeVisible();

    // El campo no admite más de 500 letras (CA-10.2).
    await evaPhone.goto(`${groupUrl}/ideas`);
    await evaPhone.getByLabel('¿Qué te gustaría?').fill('x'.repeat(600));
    await expect(evaPhone.getByText('500 de 500 letras')).toBeVisible();
    for (const p of phones) await p.context.close();
  });

  test('CP-E-13 [RF-15][CA-15.1][CA-15.2] "No soy yo" devuelve a la lista antes de ver el resultado y desaparece después', async ({
    page,
    browser,
  }) => {
    const { groupUrl } = await createGroupViaUi(page, 'No soy yo', ['Carmen', 'Paco', 'Rosa']);
    await drawViaUi(page);
    const { context, phone } = await newPhone(browser, page);
    await claimViaUi(phone, groupUrl, 'Rosa');
    await phone.getByRole('button', { name: '¿No eres Rosa? Toca aquí' }).click();
    await phone.getByRole('dialog', { name: '¿No eres Rosa?' }).getByRole('button', { name: 'Elegir otro nombre' }).click();
    await expect(phone.getByRole('heading', { name: '¿Quién eres tú? Toca tu nombre' })).toBeVisible();
    await expect(phone.getByRole('button', { name: 'Rosa', exact: true })).toBeVisible();

    await claimViaUi(phone, groupUrl, 'Paco');
    await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
    await phone.getByRole('link', { name: '‹ Volver' }).click();
    await expect(phone.getByRole('heading', { level: 1, name: 'Hola, Paco' })).toBeVisible();
    await expect(phone.getByRole('button', { name: /No eres Paco/ })).toHaveCount(0);
    await context.close();
  });
});
