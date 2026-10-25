import { Order, Product, CATEGORIES } from './db';
import { PdfTemplateSettings } from './settings';
import { getOrderWorkshopType, getWorkshopTypeLabel, getStageInfo, getDefaultWorkshopStatus } from './workshop';

const DEFAULT_PDF_CONFIG: PdfTemplateSettings = {
    nombreEmpresa: 'BOHEME • Indumentaria & Equipos Médicos',
    rifEmpresa: 'V-24.354.847',
    direccionFiscal: 'Municipio Miranda (Coro) y Municipio Colina (La Vela), Estado Falcón, Venezuela',
    telefonoContacto: '0412-1409976',
    emailContacto: 'worldglobalweb724@gmail.com',
    colorPrimario: '#5F2142',
    colorAcento: '#D86A33',
    mostrarLogo: true,
    mostrarTasaBcv: true,
    mostrarFirmas: true,
    mostrarSelloAgua: true,
    encabezadoFactura: 'FACTURA / COMPROBANTE DE COMPRA',
    piePaginaFactura: 'Gracias por tu compra en BOHEME. Entregas locales en Municipio Miranda y Municipio Colina, y envíos nacionales garantizados.',
    encabezadoReporte: 'REPORTE OFICIAL DE GESTIÓN ADMINISTRATIVA',
    piePaginaReporte: 'Documento generado por el Panel Administrativo de BOHEME • Uso Interno y Contable.',
    tamanoPapel: 'letter',
    orientacionReporte: 'portrait'
};

function openPdfWindow(htmlContent: string) {
    const printWin = window.open('', '_blank');
    if (!printWin) {
        alert('Por favor habilita las ventanas emergentes en tu navegador para generar y descargar el PDF.');
        return;
    }
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
}

function getBaseStyles(cfg: PdfTemplateSettings, isReport = false) {
    const primary = cfg.colorPrimario || '#5F2142';
    const accent = cfg.colorAcento || '#D86A33';
    const pageSize = cfg.tamanoPapel === 'a4' ? 'A4' : 'letter';
    const orientation = isReport ? (cfg.orientacionReporte || 'portrait') : 'portrait';

    return `
        @page {
            size: ${pageSize} ${orientation};
            margin: 14mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 24px;
            font-size: 12px;
            line-height: 1.45;
            background: #ffffff;
            position: relative;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1f121d;
            color: #fff;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .toolbar-btn {
            background: ${accent};
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
        }
        .toolbar-btn.secondary {
            background: rgba(255,255,255,0.15);
        }
        .watermark {
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 86px;
            font-weight: 900;
            color: rgba(95, 33, 66, 0.035);
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
            letter-spacing: 8px;
        }
        .doc-container {
            position: relative;
            z-index: 1;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid ${primary};
            padding-bottom: 16px;
            margin-bottom: 20px;
            gap: 16px;
        }
        .brand-box {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .brand-logo {
            height: 50px;
            width: auto;
            object-fit: contain;
        }
        .company-name {
            font-size: 18px;
            font-weight: 900;
            color: ${primary};
            letter-spacing: -0.3px;
        }
        .company-meta {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
        }
        .doc-title-box {
            text-align: right;
        }
        .doc-badge {
            display: inline-block;
            background: ${primary};
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            padding: 4px 12px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }
        .doc-number {
            font-size: 20px;
            font-weight: 900;
            color: ${accent};
            margin-top: 4px;
            font-family: monospace;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        .kpi-card {
            border: 1px solid #e5e7eb;
            border-left: 4px solid ${primary};
            border-radius: 10px;
            padding: 10px 14px;
            background: #fdfaf7;
        }
        .kpi-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #6b7280;
        }
        .kpi-value {
            font-size: 17px;
            font-weight: 900;
            color: ${primary};
            margin-top: 2px;
        }
        .kpi-sub {
            font-size: 10px;
            color: ${accent};
            font-weight: 700;
        }
        .section-box {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 16px;
            background: #ffffff;
        }
        .section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            color: ${primary};
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 6px;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 11px;
        }
        th {
            background: ${primary};
            color: #ffffff;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        tr:nth-child(even) td {
            background: #fcfaf8;
        }
        .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .pill-green { background: #d1fae5; color: #065f46; }
        .pill-amber { background: #fef3c7; color: #92400e; }
        .pill-red { background: #fee2e2; color: #991b1b; }
        .pill-purple { background: #f3e8ff; color: #6b21a8; }
        .totals-box {
            margin-left: auto;
            width: 300px;
            border: 2px solid ${primary};
            border-radius: 10px;
            padding: 12px 16px;
            background: #fff9f5;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 12px;
        }
        .totals-row.final {
            border-top: 1px solid #d1d5db;
            margin-top: 6px;
            padding-top: 8px;
            font-size: 15px;
            font-weight: 900;
            color: ${primary};
        }
        .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 42px;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #4b5563;
        }
        .sig-line {
            width: 210px;
            border-top: 1.5px solid #374151;
            padding-top: 6px;
            font-weight: 700;
        }
        .footer {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px dashed #d1d5db;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }
        @media print {
            .toolbar { display: none !important; }
            body { padding: 0; }
        }
    `;
}

// ==========================================
// 1. FACTURA INDIVIDUAL PDF
// ==========================================
export function generateInvoicePdf(order: Order, pdfConfig?: Partial<PdfTemplateSettings>, currentBcvRate = 887.30) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const statusNorm = (order.estado_pago === 'verificada' || order.estado_pago === 'verificado')
        ? { label: 'VERIFICADA / PAGADA', cls: 'pill-green' }
        : (order.estado_pago === 'rechazada' || order.estado_pago === 'rechazado')
            ? { label: 'RECHAZADA', cls: 'pill-red' }
            : { label: 'POR VERIFICAR', cls: 'pill-amber' };

    const bcvUsed = order.tasa_bcv || currentBcvRate;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Factura ${order.numero_factura} - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, false)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>📄 Vista Previa de Factura PDF: ${order.numero_factura}</strong>
                    <span style="font-size: 11px; opacity: 0.8; margin-left: 10px;">Usa "Guardar como PDF" en el destino de impresión</span>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">RIF / C.I: ${cfg.rifEmpresa} • Tel: ${cfg.telefonoContacto}</div>
                            <div class="company-meta">${cfg.direccionFiscal}</div>
                            ${cfg.emailContacto ? `<div class="company-meta">${cfg.emailContacto}</div>` : ''}
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoFactura}</div>
                        <div class="doc-number">N° ${order.numero_factura}</div>
                        <div class="company-meta">Fecha: ${new Date(order.created_at).toLocaleString('es-VE')}</div>
                        <div style="margin-top: 4px;"><span class="pill ${statusNorm.cls}">${statusNorm.label}</span></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                    <div class="section-box" style="margin-bottom: 0;">
                        <div class="section-title">Datos del Cliente</div>
                        <div><strong>Nombre y Apellido:</strong> ${order.cliente_nombre} ${order.cliente_apellido}</div>
                        <div><strong>Cédula / RIF:</strong> ${order.cliente_cedula}</div>
                        <div><strong>Teléfono / WhatsApp:</strong> ${order.cliente_telefono}</div>
                        <div><strong>Modalidad de Entrega:</strong> ${order.tipo_entrega === 'local' ? 'Entrega Local (Mcpio. Miranda / Mcpio. Colina)' : `Envío Nacional (${order.empresa_envio || 'MRW'})`}</div>
                        <div><strong>Dirección / Destino:</strong> ${order.direccion_entrega} ${order.ciudad ? `(${order.ciudad}, ${order.estado || ''})` : ''}</div>
                        ${order.numero_guia_envio ? `<div><strong>N° Guía de Envío:</strong> ${order.numero_guia_envio}</div>` : ''}
                    </div>

                    <div class="section-box" style="margin-bottom: 0;">
                        <div class="section-title">Información de Pago</div>
                        <div><strong>Método de Pago:</strong> ${order.nombre_metodo_pago || (order.metodo_pago === 'pago_movil' ? 'Pago Móvil' : order.metodo_pago === 'binance' ? 'Binance Pay (USDT)' : order.metodo_pago.toUpperCase())}</div>
                        ${order.banco_emisor ? `<div><strong>Banco / Plataforma Origen:</strong> ${order.banco_emisor}</div>` : ''}
                        <div><strong>Cuenta / Emisor:</strong> ${order.telefono_o_email_emisor}</div>
                        <div><strong>N° Referencia / TxID:</strong> <span style="font-family: monospace; font-weight: 900;">${order.referencia_pago}</span></div>
                        ${cfg.mostrarTasaBcv ? `<div><strong>Tasa Oficial BCV Aplicada:</strong> ${bcvUsed} Bs/$</div>` : ''}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 45px;">#</th>
                            <th>Descripción del Producto & Especificaciones</th>
                            <th style="width: 75px; text-align: center;">Cant.</th>
                            <th style="width: 100px; text-align: right;">P. Unit ($ USD)</th>
                            <th style="width: 110px; text-align: right;">Subtotal ($ USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((it, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>
                                    <div style="font-weight: 800; color: #111827;">${it.name}</div>
                                    ${(it.is_personalizado || it.nombre_personalizado || it.especialidad_personalizada || it.color_preferencia || it.detalles_personalizados) ? `
                                        <div style="margin-top: 4px; font-size: 10px; color: #4b5563; background: #fff9f5; padding: 4px 8px; border-left: 2px solid ${cfg.colorAcento}; border-radius: 4px;">
                                            ${it.nombre_personalizado ? `<div><strong>• Bordado / Nombre:</strong> ${it.nombre_personalizado}</div>` : ''}
                                            ${it.especialidad_personalizada ? `<div><strong>• Especialidad:</strong> ${it.especialidad_personalizada}</div>` : ''}
                                            ${it.color_preferencia ? `<div><strong>• Color / Preferencia:</strong> ${it.color_preferencia}</div>` : ''}
                                            ${it.detalles_personalizados ? `<div><strong>• Detalles:</strong> ${it.detalles_personalizados}</div>` : ''}
                                        </div>
                                    ` : ''}
                                </td>
                                <td style="text-align: center; font-weight: 700;">${it.quantity}</td>
                                <td style="text-align: right;">$${Number(it.price).toFixed(2)}</td>
                                <td style="text-align: right; font-weight: 800;">$${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-box">
                    <div class="totals-row">
                        <span>Total en Divisas ($ USD):</span>
                        <strong>$${order.monto_usd.toFixed(2)} USD</strong>
                    </div>
                    ${cfg.mostrarTasaBcv ? `
                        <div class="totals-row">
                            <span>Tasa BCV Aplicada:</span>
                            <span>${bcvUsed} Bs/$</span>
                        </div>
                    ` : ''}
                    <div class="totals-row final">
                        <span>Total en Bolívares:</span>
                        <span>Bs. ${order.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Emitido por Administración ${cfg.nombreEmpresa.split('•')[0]}</div>
                        <div class="sig-line">Recibido Conforme (${order.cliente_nombre} ${order.cliente_apellido})</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaFactura}</strong></div>
                    <div style="margin-top: 4px;">Comprobante N° ${order.numero_factura} • Impreso el ${new Date().toLocaleString('es-VE')}</div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 2. REPORTE DE FACTURADO (VENTAS E INGRESOS) PDF
// ==========================================
export function generateBillingReportPdf(
    orders: Order[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>,
    currentBcvRate = 887.30
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const totalUsd = orders.reduce((acc, o) => acc + o.monto_usd, 0);
    const totalBs = orders.reduce((acc, o) => acc + o.monto_bs, 0);
    const verifiedOrders = orders.filter(o => o.estado_pago === 'verificada' || o.estado_pago === 'verificado');
    const totalVerifiedUsd = verifiedOrders.reduce((acc, o) => acc + o.monto_usd, 0);
    const pmOrders = orders.filter(o => o.metodo_pago === 'pago_movil');
    const binanceOrders = orders.filter(o => o.metodo_pago === 'binance');

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte de Facturado - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, true)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>📊 Reporte de Facturado y Ventas (${orders.length} registros)</strong>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">RIF: ${cfg.rifEmpresa} • ${cfg.direccionFiscal}</div>
                            <div class="company-meta">Filtro aplicado: <strong>${filterSummary}</strong></div>
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoReporte}</div>
                        <div class="doc-number" style="font-size: 15px;">REPORTE DE FACTURADO</div>
                        <div class="company-meta">Generado: ${new Date().toLocaleString('es-VE')}</div>
                        ${cfg.mostrarTasaBcv ? `<div class="company-meta">Tasa BCV Ref: <strong>${currentBcvRate} Bs/$</strong></div>` : ''}
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Facturado</div>
                        <div class="kpi-value">$${totalUsd.toFixed(2)} USD</div>
                        <div class="kpi-sub">Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pagos Verificados</div>
                        <div class="kpi-value">$${totalVerifiedUsd.toFixed(2)} USD</div>
                        <div class="kpi-sub">${verifiedOrders.length} de ${orders.length} facturas</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pago Móvil / Bs</div>
                        <div class="kpi-value">$${pmOrders.reduce((a, b) => a + b.monto_usd, 0).toFixed(2)}</div>
                        <div class="kpi-sub">${pmOrders.length} operaciones</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Binance / Divisas</div>
                        <div class="kpi-value">$${binanceOrders.reduce((a, b) => a + b.monto_usd, 0).toFixed(2)}</div>
                        <div class="kpi-sub">${binanceOrders.length} operaciones</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>N° Factura</th>
                            <th>Fecha</th>
                            <th>Cliente & Cédula</th>
                            <th>Artículos</th>
                            <th>Método / Ref</th>
                            <th>Estatus</th>
                            <th style="text-align: right;">Monto ($ USD)</th>
                            <th style="text-align: right;">Monto (Bs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const st = (o.estado_pago === 'verificada' || o.estado_pago === 'verificado')
                                ? { l: 'Verificada', c: 'pill-green' }
                                : (o.estado_pago === 'rechazada' || o.estado_pago === 'rechazado')
                                    ? { l: 'Rechazada', c: 'pill-red' }
                                    : { l: 'Por Verificar', c: 'pill-amber' };
                            return `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 900; color: ${cfg.colorPrimario};">${o.numero_factura}</td>
                                    <td>${new Date(o.created_at).toLocaleDateString('es-VE')}</td>
                                    <td>
                                        <strong>${o.cliente_nombre} ${o.cliente_apellido}</strong><br/>
                                        <span style="color: #6b7280; font-size: 10px;">${o.cliente_cedula} • ${o.cliente_telefono}</span>
                                    </td>
                                    <td>
                                        ${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </td>
                                    <td>
                                        <strong>${o.nombre_metodo_pago || (o.metodo_pago === 'pago_movil' ? 'Pago Móvil' : o.metodo_pago === 'binance' ? 'Binance' : o.metodo_pago)}</strong><br/>
                                        <span style="font-family: monospace; font-size: 10px;">Ref: ${o.referencia_pago}</span>
                                    </td>
                                    <td><span class="pill ${st.c}">${st.l}</span></td>
                                    <td style="text-align: right; font-weight: 800;">$${o.monto_usd.toFixed(2)}</td>
                                    <td style="text-align: right;">Bs. ${o.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="totals-box">
                    <div class="totals-row">
                        <span>Total Registros:</span>
                        <strong>${orders.length} facturas</strong>
                    </div>
                    <div class="totals-row">
                        <span>Total General ($ USD):</span>
                        <strong>$${totalUsd.toFixed(2)} USD</strong>
                    </div>
                    <div class="totals-row final">
                        <span>Total General (Bs.):</span>
                        <span>Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Firma Administración / Finanzas</div>
                        <div class="sig-line">Auditoría / Gerencia General</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaReporte}</strong></div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 3. REPORTE DE TALLER Y PRODUCCIÓN PDF
// ==========================================
export function generateWorkshopReportPdf(
    orders: Order[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const activos = orders.filter(o => !o.pedido_cerrado).length;
    const cerrados = orders.filter(o => o.pedido_cerrado).length;
    const locales = orders.filter(o => o.tipo_entrega === 'local').length;
    const nacionales = orders.filter(o => o.tipo_entrega === 'nacional').length;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte de Taller y Pedidos - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, true)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>✂️ Reporte de Taller, Confección y Despacho (${orders.length} pedidos)</strong>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME TALLER</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">Control de Producción, Bordado, Imprenta, Costura y Despacho</div>
                            <div class="company-meta">Filtro: <strong>${filterSummary}</strong></div>
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoReporte}</div>
                        <div class="doc-number" style="font-size: 15px;">REPORTE DE TALLER Y PEDIDOS</div>
                        <div class="company-meta">Fecha: ${new Date().toLocaleString('es-VE')}</div>
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Pedidos Listados</div>
                        <div class="kpi-value">${orders.length}</div>
                        <div class="kpi-sub">Órdenes de trabajo</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">En Producción (Activos)</div>
                        <div class="kpi-value">${activos}</div>
                        <div class="kpi-sub">Pendientes por cerrar</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pedidos Cerrados</div>
                        <div class="kpi-value">${cerrados}</div>
                        <div class="kpi-sub">Completados / Entregados</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Modalidad de Entrega</div>
                        <div class="kpi-value">${locales} Local / ${nacionales} Nac.</div>
                        <div class="kpi-sub">Miranda & Colina vs Envíos</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Factura</th>
                            <th>Cliente & Contacto</th>
                            <th>Tipo Flujo</th>
                            <th>Detalle de Prendas & Personalización</th>
                            <th>Entrega / Destino</th>
                            <th>Estatus Taller</th>
                            <th>Estado Cierre</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const wType = getOrderWorkshopType(o);
                            const currentStageKey = o.estado_taller || getDefaultWorkshopStatus(o.items, o.tipo_entrega);
                            const stageInfo = getStageInfo(currentStageKey);
                            return `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 900; color: ${cfg.colorPrimario};">
                                        ${o.numero_factura}<br/>
                                        <span style="font-size: 9px; color: #6b7280;">${new Date(o.created_at).toLocaleDateString('es-VE')}</span>
                                    </td>
                                    <td>
                                        <strong>${o.cliente_nombre} ${o.cliente_apellido}</strong><br/>
                                        <span style="font-size: 10px; color: #6b7280;">${o.cliente_telefono}</span>
                                    </td>
                                    <td><span class="pill pill-purple">${getWorkshopTypeLabel(wType)}</span></td>
                                    <td>
                                        ${o.items.map(it => `
                                            <div style="margin-bottom: 4px;">
                                                <strong>• ${it.quantity}x ${it.name}</strong>
                                                ${it.nombre_personalizado ? `<br/><span style="color: ${cfg.colorPrimario}; font-size: 10px;">↳ Bordado: <strong>${it.nombre_personalizado}</strong></span>` : ''}
                                                ${it.especialidad_personalizada ? `<span style="color: #4b5563; font-size: 10px;"> (${it.especialidad_personalizada})</span>` : ''}
                                                ${it.color_preferencia ? `<br/><span style="color: #6b7280; font-size: 10px;">↳ Color: ${it.color_preferencia}</span>` : ''}
                                            </div>
                                        `).join('')}
                                        ${o.notas_taller ? `<div style="font-size: 10px; color: #92400e; background: #fef3c7; padding: 3px 6px; border-radius: 4px; margin-top: 3px;">Nota: ${o.notas_taller}</div>` : ''}
                                    </td>
                                    <td>
                                        <strong>${o.tipo_entrega === 'local' ? '🏠 Local (Miranda/Colina)' : `📦 ${o.empresa_envio || 'Nacional'}`}</strong><br/>
                                        <span style="font-size: 10px; color: #4b5563;">${o.direccion_entrega}</span>
                                        ${o.numero_guia_envio ? `<br/><span style="font-family: monospace; font-size: 10px; color: #0369a1;">Guía: ${o.numero_guia_envio}</span>` : ''}
                                    </td>
                                    <td><span class="pill pill-amber">${stageInfo.icon} ${stageInfo.label}</span></td>
                                    <td>
                                        <span class="pill ${o.pedido_cerrado ? 'pill-green' : 'pill-amber'}">
                                            ${o.pedido_cerrado ? '✓ CERRADO' : 'EN CURSO'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Jefe de Taller y Confección</div>
                        <div class="sig-line">Control de Calidad y Despacho</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaReporte}</strong></div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 4. REPORTE DE PRODUCTOS EN STOCK / CATÁLOGO PDF
// ==========================================
export function generateStockReportPdf(
    products: Product[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>,
    currentBcvRate = 887.30
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const totalUnidades = products.reduce((acc, p) => acc + (p.stock !== undefined ? Number(p.stock) : 20), 0);
    const valorInventarioUsd = products.reduce((acc, p) => acc + (p.price * (p.stock !== undefined ? Number(p.stock) : 20)), 0);
    const valorInventarioBs = valorInventarioUsd * currentBcvRate;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte de Productos en Stock - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, true)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>📦 Reporte de Productos en Stock y Catálogo (${products.length} productos)</strong>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME STOCK</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">Inventario General de Productos, Precios en USD y Equivalente BCV</div>
                            <div class="company-meta">Sección: <strong>${filterSummary}</strong></div>
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoReporte}</div>
                        <div class="doc-number" style="font-size: 15px;">REPORTE DE PRODUCTOS EN STOCK</div>
                        <div class="company-meta">Fecha: ${new Date().toLocaleString('es-VE')}</div>
                        ${cfg.mostrarTasaBcv ? `<div class="company-meta">Tasa BCV: <strong>${currentBcvRate} Bs/$</strong></div>` : ''}
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Modelos en Catálogo</div>
                        <div class="kpi-value">${products.length}</div>
                        <div class="kpi-sub">Productos registrados</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Unidades en Stock</div>
                        <div class="kpi-value">${totalUnidades} uds.</div>
                        <div class="kpi-sub">Disponibilidad física</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Valor Inventario ($ USD)</div>
                        <div class="kpi-value">$${valorInventarioUsd.toFixed(2)}</div>
                        <div class="kpi-sub">Base en divisas</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Valor Inventario (Bs.)</div>
                        <div class="kpi-value" style="font-size: 14px;">Bs. ${valorInventarioBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div class="kpi-sub">A tasa ${currentBcvRate} Bs/$</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 55px;">Código</th>
                            <th>Producto & Descripción</th>
                            <th>Sección / Subcategoría</th>
                            <th style="text-align: center;">Stock</th>
                            <th style="text-align: right;">Precio Unit ($ USD)</th>
                            <th style="text-align: right;">Precio (Bs. BCV)</th>
                            <th style="text-align: right;">Valor Stock ($ USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => {
                            const cat = CATEGORIES[p.categoria_slug];
                            const sub = cat?.subcategories.find(s => s.id === p.subcategoria_id);
                            const stockQty = p.stock !== undefined ? Number(p.stock) : 20;
                            const priceBs = p.price * currentBcvRate;
                            return `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 800;">#${p.id}</td>
                                    <td>
                                        <strong>${p.name}</strong><br/>
                                        <span style="font-size: 10px; color: #6b7280;">${p.description || ''}</span>
                                    </td>
                                    <td>
                                        <strong>${cat?.title || p.categoria_slug}</strong><br/>
                                        <span style="font-size: 10px; color: #6b7280;">${sub?.name || 'General'}</span>
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="pill ${stockQty > 5 ? 'pill-green' : stockQty > 0 ? 'pill-amber' : 'pill-red'}">
                                            ${stockQty} uds
                                        </span>
                                    </td>
                                    <td style="text-align: right; font-weight: 800; color: ${cfg.colorPrimario};">$${p.price.toFixed(2)}</td>
                                    <td style="text-align: right;">Bs. ${priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style="text-align: right; font-weight: 800;">$${(p.price * stockQty).toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Responsable de Almacén e Inventario</div>
                        <div class="sig-line">Administración BOHEME</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaReporte}</strong></div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 5. EXPORTAR A CSV / EXCEL COMPATIBLE
// ==========================================
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
    const escapeCell = (val: string | number) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
    };
    const csvContent = '\uFEFF' + [
        headers.map(escapeCell).join(';'),
        ...rows.map(r => r.map(escapeCell).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
