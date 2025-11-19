# FormsPdfApp

A minimal .NET 8 Razor Pages app that collects form data (3 forms) and generates a PDF using QuestPDF.
This project includes your uploaded assets:
- Letterhead image: `wwwroot/images/letterhead.png` (copied from `/mnt/data/LETTER HEAD.png`)
- Signature image: `wwwroot/images/signature.png` (copied from `/mnt/data/signature_owner.png`)
- Reference Excel: `REFFER_REPORT_FORMAT_20RH_40RH.xlsx` (copied from `/mnt/data/REFFER REPORT FORMAT 20RH 40RH.xlsx`)

## How to run locally

1. Install .NET 8 SDK.
2. In the project folder, run:
   ```bash
   dotnet restore
   dotnet build
   dotnet run
   ```
3. Open `http://localhost:5000` (or the URL printed by `dotnet run`).
4. Fill the forms in order: Service Form → Client Form → Details Form → Generate PDF.

## GitHub Actions Workflow

A sample GitHub Actions workflow is included at `.github/workflows/deploy.yml` to build and publish the `wwwroot` as artifact or to GitHub Pages (you may adapt it).

