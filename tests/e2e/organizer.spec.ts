import { claimViaUi, createGroupViaUi, drawViaUi, expect, newPhone, test } from './support';

test.describe('Organizador', () => {
  test('CP-E-01 [RF-01][RF-02][RF-03][CA-01.1][CA-01.8][CA-03.1][CA-03.2][CA-03.4] crea el grupo y puede compartir el enlace antes del sorteo', async ({
    page,
    context,
    browserName,
  }) => {
    await page.goto('/nuevo');
    await expect(page.getByText('Solo se guardan los nombres y las ideas de regalo.')).toBeVisible();
    const { gid } = await createGroupViaUi(page, 'Navidad Familia 2027', ['Carmen', 'Paco', 'Rosa'], {
      budget: '20 €',
      date: '2099-12-24',
    });

    await expect(page.getByText('24 de diciembre de 2099')).toBeVisible();
    await expect(page.getByText('20 €')).toBeVisible();
    // La URL del panel no muestra la clave (ADR-0006).
    expect(page.url()).not.toContain('#');

    const whatsapp = page.getByRole('link', { name: 'Enviar por WhatsApp' });
    const href = (await whatsapp.getAttribute('href'))!;
    expect(href.startsWith('https://wa.me/?text=')).toBe(true);
    const text = decodeURIComponent(href.replace('https://wa.me/?text=', ''));
    expect(text).toBe(
      `🎁 ¡Amigo invisible «Navidad Familia 2027»! Toca este enlace, elige tu nombre y descubre a quién le haces el regalo: ${new URL(page.url()).origin}/g/${gid}`,
    );
    await expect(whatsapp).toHaveAttribute('target', '_blank');
    await expect(whatsapp).toHaveAttribute('rel', /noopener/);

    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copiar enlace' }).click();
    await expect(page.getByRole('status')).toContainText(/Enlace copiado|No se ha podido copiar/);
    if (browserName === 'chromium') {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${new URL(page.url()).origin}/g/${gid}`);
    }
  });

  test('CP-E-02 [RF-04][CA-04.1][CA-04.5] antes del sorteo se cambian nombres desde el panel', async ({ page }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Cena amigos', ['Ana', 'Pepe', 'Luis']);
    await page.getByRole('link', { name: 'Cambiar nombres o datos' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Cambiar nombres y datos' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Nombre de la persona 2' }).fill('José');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByRole('status')).toContainText('Cambios guardados');
    await page.goto(groupUrl);
    await expect(page.getByRole('button', { name: 'José', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pepe', exact: true })).toHaveCount(0);
  });

  test('CP-E-03 [RF-05][RF-12][CA-05.3][CA-12.1][CA-12.2] sortea sin ver resultados y sigue quién lo ha visto', async ({
    page,
    browser,
  }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Seguimiento', ['Carmen', 'Paco', 'Rosa']);
    const { context, phone } = await newPhone(browser, page);
    await claimViaUi(phone, groupUrl, 'Paco');

    await page.reload();
    const row = (name: string) => page.getByRole('listitem').filter({ hasText: name });
    await expect(row('Paco')).toContainText('Ha entrado');
    await expect(row('Carmen')).toContainText('Sin entrar');

    await drawViaUi(page);
    await expect(page.getByText('0 de 3 ya saben a quién regalan.')).toBeVisible();

    await phone.reload();
    await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
    await expect(phone.getByTestId('receiver-name')).toBeVisible();
    const receiver = (await phone.getByTestId('receiver-name').textContent())!;

    await page.reload();
    await expect(row('Paco')).toContainText('✓ Ha visto a su amigo');
    await expect(page.getByText('1 de 3 ya saben a quién regalan.')).toBeVisible();
    // El panel nunca muestra a quién le ha tocado cada uno (CA-05.3, CA-12.3).
    await expect(page.getByText(`Te ha tocado regalar a`)).toHaveCount(0);
    expect(receiver).not.toBe('Paco');
    await context.close();
  });

  test('CP-E-04 [RF-06][CA-06.1][CA-06.3] repetir el sorteo avisa si alguien ya lo vio; cancelar no cambia nada', async ({
    page,
    browser,
  }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Repetir', ['Carmen', 'Paco', 'Rosa']);
    await drawViaUi(page);
    const { context, phone } = await newPhone(browser, page);
    await claimViaUi(phone, groupUrl, 'Rosa');
    await phone.getByRole('link', { name: '🎁 Ver a quién regalo' }).click();
    await expect(phone.getByTestId('receiver-name')).toBeVisible();

    await page.reload();
    await page.getByText('Más opciones').click();
    await page.getByRole('button', { name: 'Repetir el sorteo' }).click();
    const dialog = page.getByRole('dialog', { name: '¿Repetir el sorteo?' });
    await expect(dialog).toContainText('1 persona ya ha visto a quién regalan. Si repites el sorteo, tendrán que volver a mirarlo.');
    await dialog.getByRole('button', { name: 'No, dejarlo como está' }).click();
    await expect(page.getByText('1 de 3 ya saben a quién regalan.')).toBeVisible();

    await page.getByRole('button', { name: 'Repetir el sorteo' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sí, repetir' }).click();
    await expect(page.getByRole('status')).toContainText('Sorteo repetido');
    await expect(page.getByText('0 de 3 ya saben a quién regalan.')).toBeVisible();
    await context.close();
  });

  test('CP-E-05 [RF-06][CA-06.2][CA-05.4] deshacer el sorteo vuelve a permitir cambiar personas', async ({ page }) => {
    await createGroupViaUi(page, 'Deshacer', ['Carmen', 'Paco', 'Rosa']);
    await drawViaUi(page);
    await page.getByText('Más opciones').click();
    await page.getByRole('link', { name: 'Cambiar nombre, fecha o presupuesto' }).click();
    await expect(page.getByText('Para cambiar las personas, primero deshaz el sorteo')).toBeVisible();
    await page.getByRole('link', { name: '‹ Volver' }).click();
    await page.getByText('Más opciones').click();
    await page.getByRole('button', { name: 'Deshacer el sorteo para cambiar personas' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sí, deshacer' }).click();
    await expect(page.getByRole('button', { name: 'Hacer el sorteo' })).toBeVisible();
  });

  test('CP-E-06 [RF-14][CA-14.1][CA-14.2][CA-08.2] dejar entrar de nuevo libera el nombre en el móvil anterior', async ({
    page,
    browser,
  }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Liberar', ['Carmen', 'Paco', 'Rosa']);
    const { context, phone } = await newPhone(browser, page);
    await claimViaUi(phone, groupUrl, 'Carmen');
    await page.reload();
    await page.getByRole('listitem').filter({ hasText: 'Carmen' }).getByRole('button', { name: 'Dejar entrar de nuevo' }).click();
    await page.getByRole('dialog', { name: '¿Dejar entrar de nuevo a Carmen?' }).getByRole('button', { name: 'Sí, dejar entrar' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: 'Carmen' })).toContainText('Sin entrar');

    await phone.reload();
    await expect(phone.getByRole('heading', { name: '¿Quién eres tú? Toca tu nombre' })).toBeVisible();
    await expect(phone.getByRole('button', { name: 'Carmen', exact: true })).toBeVisible();
    await context.close();
  });

  test('CP-E-07 [RF-16][CA-16.1][CA-18.2] borrar el grupo hace que el enlace deje de funcionar', async ({ page, browser }) => {
    const { groupUrl } = await createGroupViaUi(page, 'Borrar', ['Carmen', 'Paco', 'Rosa']);
    const { context, phone } = await newPhone(browser, page);
    await claimViaUi(phone, groupUrl, 'Paco');
    await page.getByText('Más opciones').click();
    await page.getByRole('button', { name: 'Borrar este amigo invisible' }).click();
    await page.getByRole('dialog', { name: '¿Borrar «Borrar»?' }).getByRole('button', { name: 'Sí, borrar' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Amigo Invisible' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Borrar/ })).toHaveCount(0);

    await phone.reload();
    await expect(phone.getByRole('heading', { name: 'No encontramos este amigo invisible' })).toBeVisible();
    await phone.getByRole('link', { name: 'Ir al inicio' }).click();
    await expect(phone.getByRole('link', { name: /Borrar/ })).toHaveCount(0);
    await context.close();
  });

  test('CP-E-08 [RF-02][CA-02.1][CA-02.2][CA-02.3][RF-18][CA-18.1] el panel se recupera desde otro móvil con el enlace de organizador', async ({
    page,
    browser,
  }) => {
    const { gid } = await createGroupViaUi(page, 'Recuperar', ['Carmen', 'Paco', 'Rosa']);
    const href = (await page.getByRole('link', { name: 'Enviármelo por WhatsApp' }).getAttribute('href'))!;
    const organizerLink = /(https?:\/\/\S+#[A-Za-z0-9_-]{43})/.exec(decodeURIComponent(href))![1]!;

    // Mismo móvil: la portada lo recuerda.
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Recuperar\s*Organizas/ })).toBeVisible();

    const { context, phone } = await newPhone(browser, page);
    await phone.goto(organizerLink);
    await expect(phone.getByRole('heading', { level: 1, name: 'Recuperar' })).toBeVisible();
    expect(phone.url()).toBe(`${new URL(organizerLink).origin}/g/${gid}/organizar`);
    await phone.goto('/');
    await expect(phone.getByRole('link', { name: /Recuperar\s*Organizas/ })).toBeVisible();

    const { context: c2, phone: stranger } = await newPhone(browser, page);
    await stranger.goto(`/g/${gid}/organizar#${'X'.repeat(43)}`);
    await expect(stranger.getByRole('heading', { name: 'Este enlace de organizador no es válido' })).toBeVisible();
    await stranger.goto(`/g/${gid}/organizar`);
    await expect(stranger.getByRole('heading', { name: 'Este enlace de organizador no es válido' })).toBeVisible();
    await context.close();
    await c2.close();
  });

  test('CP-E-09 [RF-01][CA-01.2][CA-01.3][CA-01.5][CA-01.6] el formulario explica los errores junto al campo', async ({ page }) => {
    await page.goto('/nuevo');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByText('Escribe el nombre del grupo.')).toBeVisible();

    await page.getByLabel('Nombre del grupo').fill('Errores');
    const add = page.getByRole('textbox', { name: 'Nombre de la persona', exact: true });
    for (const person of ['María', 'Pepe']) {
      await add.fill(person);
      await page.getByRole('button', { name: 'Añadir' }).click();
    }
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByText('Hacen falta al menos 3 personas.')).toBeVisible();

    await add.fill('maria ');
    await page.getByRole('button', { name: 'Añadir' }).click();
    await expect(page.getByText('Ya hay alguien llamado María. Añade una inicial, por ejemplo «María G.»')).toBeVisible();

    // Un nombre escrito sin pulsar «Añadir» se añade al crear.
    await add.fill('Rosa');
    await page.getByLabel(/Fecha de entrega/).fill('2020-01-01');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByText('La fecha ya ha pasado.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Nombre de la persona 3' })).toHaveValue('Rosa');
  });

  test('CP-E-20 [RF-01][CA-01.4] con 40 personas el botón «Añadir» deja de permitir más', async ({ page }) => {
    await page.goto('/nuevo');
    const add = page.getByRole('textbox', { name: 'Nombre de la persona', exact: true });
    for (let i = 1; i <= 40; i++) {
      await add.fill(`Persona ${i}`);
      await add.press('Enter');
    }
    await expect(page.getByRole('textbox', { name: 'Nombre de la persona 40' })).toHaveValue('Persona 40');
    await expect(page.getByRole('button', { name: 'Añadir' })).toBeDisabled();
    await expect(add).toBeDisabled();
    await expect(page.getByText('Máximo 40 personas.')).toBeVisible();
  });
});
