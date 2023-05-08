// Importation des modules
import express from 'express';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv'; // Ajoutez cette ligne

dotenv.config();

// Création de l'application express
const app = express();
const port = 3000;

// Route pour générer un PDF à partir d'un fichier HTML
app.get('/generate-pdf', async (requete, reponse) => {
  try {
    // Options de lancement spécifiques à Linux
    const optionsLancement = {
      executablePath: 'chromium-browser',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ],
    };

    // Créer une instance de navigateur en mode headless
    const navigateur = await puppeteer.launch(optionsLancement);
    const page = await navigateur.newPage();

    // Charger le code HTML embarqué
    const htmlCode = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Facture n°12345</title>
            <style>
                /* styles pour la mise en forme de la facture */
                body {
                font-family: Arial, sans-serif;
                }
                table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
                padding: 0 20px;
                }
                th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
                }
                th {
                background-color: #ccc;
                }
                .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                }
                .logo {
                width: 150px;
                height: 150px;
                background-color: #eee;
                margin-top: 0;
                }
                .company-info, .client-info {
                display: inline-block;
                vertical-align: top;
                width: 49%;
                }
                .company-info h2, .client-info h2 {
                margin-top: 0;
                }
                .invoice-number {
                background-color: #eee;
                padding: 5px 10px;
                border-radius: 5px;
                color: red;
                }
                .date-label {
                color: black;
                font-weight: bold;
                }
                .client-info {
                text-align: right;
                }
                .logo img {
                  width: 150px;
                  height: auto;
              }
                
            </style>
        </head>
        <body>
            <div class="header">
              <div class="logo">
              <img src="${process.env.LOGO_BASE64}">
              </div>
              <h1 class="invoice-number">Facture n°12345</h1>
            </div>
            <div>
                <div class="company-info">
                

                    <p>Adresse : "${process.env.ADDRESS}"</p>
                    <p>Téléphone : "${process.env.PHONE}"</p>
                    <p>Email : "${process.env.EMAIL}"</p>
                </div>
                <div class="client-info">
                    <h2>Client</h2>
                    <p>Nom du client : Dupont SARL</p>
                    <p>Adresse : 456 Rue du Client, 69002 Lyon</p>
                    <p>Téléphone : 04 78 91 23 45</p>
                    <p>Email : contact@dupont.fr</p>
                </div>
            </div>
            <p><span class="date-label">Date de facture : </span><span style="color: red;">7 mai 2023</span></p>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Loyer mensuel</td>
                        <td>800,00 €</td>
                        <td>1</td>
                        <td>800,00 €</td>
                    </tr>
                    <tr>
                        <td>Dépôt de garantie</td>
                        <td>1 200,00 €</td>
                        <td>1</td>
                        <td>1 200,00 €</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Total HT</td>
                        <td>2 000,00 €</td>
                    </tr>
                    <tr>
                        <td colspan="3">TVA (20%)</td>
                        <td>400,00 €</td>
                    </tr>
                    <tr>
                        <td colspan="3">Total TTC</td>
                        <td>2 400,00 €</td>
                    </tr>
                </tfoot>
            </table>
            <p style="font-weight: bold;">Conditions de paiement :</p>
            <p>Le règlement doit être effectué dans les 30 jours suivant la date de facturation par virement bancaire. En cas de retard de paiement, des pénalités de retard seront appliquées conformément à la législation en vigueur.</p>
            <p>Merci pour votre confiance et votre collaboration.</p>
            <div style="margin-top: 20px;">
                <p style="font-weight: bold;">Coordonnées bancaires :</p>
                <p>IBAN : LU12 3456 7890 1234 5678</p>
                <p>BIC : MAGNLU2X</p>
            </div>
        </body>
    </html>      
`;

    // Charger le HTML dans la page
    // await page.setContent(htmlCode,{ baseURL: 'http://localhost:3000/img/' });
    await page.setContent(htmlCode, { waitUntil: 'networkidle0', baseURL: 'http://localhost:3000/img/' });

    page.on('console', consoleObj => console.log(consoleObj.text()));

    // Générer le PDF
    const optionsPdf = {
      format: 'A4',
      printBackground: true,
    };
    const pdfBuffer = await page.pdf(optionsPdf);

    // Fermer le navigateur
    await navigateur.close();

    // Envoyer le PDF en réponse
    reponse.contentType('application/pdf');
    reponse.send(pdfBuffer);
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).send('Erreur lors de la génération du PDF.');
  }
});
app.use('/img', express.static('public/img'));

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

