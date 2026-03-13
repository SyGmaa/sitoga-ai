import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Fetch all Gejala
    const gejalaList = await prisma.gejala.findMany({
      select: { id: true, nama: true },
    });

    // 2. Fetch all Penyakit with their Gejala relations
    const penyakitList = await prisma.penyakit.findMany({
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        gejala: {
          select: {
            gejalaId: true,
            isGejalaWajib: true,
            bobotGejala: true,
          },
        },
        tanamanObat: {
          select: {
            tanamanId: true,
          },
        },
      },
    });

    // 3. Fetch all Tanaman with their Penyakit and Pantangan relations
    const tanamanList = await prisma.tanaman.findMany({
      select: {
        id: true,
        namaLokal: true,
        namaLatin: true,
        khasiatUtama: true,
        lokasiTanam: true,
        penyakitTerkait: {
          select: {
            penyakitId: true,
          },
        },
        pantanganTanaman: {
          select: {
            kondisiMedisId: true,
            tingkatRisiko: true,
          },
        },
      },
    });

    // 4. Fetch all Kondisi Medis with pantangan count
    const kondisiList = await prisma.kondisiMedis.findMany({
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        pantanganTanaman: {
          select: {
            tanamanId: true,
            tingkatRisiko: true,
            alasan: true,
          },
        },
      },
    });

    // ========================================
    // BUILD GRAPH STRUCTURE
    // ========================================
    const nodes: any[] = [];
    const links: any[] = [];

    // -- Gejala Nodes --
    gejalaList.forEach((g) => {
      nodes.push({ id: `g_${g.id}`, type: "gejala", label: g.nama, dbId: g.id });
    });

    // -- Penyakit Nodes + Gejala↔Penyakit edges --
    penyakitList.forEach((p) => {
      nodes.push({
        id: `p_${p.id}`,
        type: "penyakit",
        label: p.nama,
        desc: p.deskripsi || "",
        dbId: p.id,
      });

      p.gejala.forEach((rel) => {
        links.push({
          source: `g_${rel.gejalaId}`,
          target: `p_${p.id}`,
          type: "gejala-penyakit",
          isWajib: rel.isGejalaWajib,
          bobot: rel.bobotGejala,
        });
      });
    });

    // -- Tanaman Nodes + Tanaman↔Penyakit edges --
    tanamanList.forEach((t) => {
      nodes.push({
        id: `t_${t.id}`,
        type: "tanaman",
        label: t.namaLokal,
        desc: `${t.namaLatin} — ${t.khasiatUtama}`,
        lokasi: t.lokasiTanam,
        dbId: t.id,
      });

      t.penyakitTerkait.forEach((rel) => {
        links.push({
          source: `t_${t.id}`,
          target: `p_${rel.penyakitId}`,
          type: "tanaman-penyakit",
        });
      });

      // Tanaman↔KondisiMedis (pantangan) edges
      t.pantanganTanaman.forEach((rel) => {
        links.push({
          source: `t_${t.id}`,
          target: `k_${rel.kondisiMedisId}`,
          type: "tanaman-kondisi",
          tingkatRisiko: rel.tingkatRisiko,
        });
      });
    });

    // -- Kondisi Medis Nodes --
    kondisiList.forEach((k) => {
      nodes.push({
        id: `k_${k.id}`,
        type: "kondisi",
        label: k.nama,
        desc: k.deskripsi || "",
        dbId: k.id,
        pantanganCount: k.pantanganTanaman.length,
      });
    });

    // Count connections per node
    const connectionCount: Record<string, number> = {};
    links.forEach((l) => {
      connectionCount[l.source] = (connectionCount[l.source] || 0) + 1;
      connectionCount[l.target] = (connectionCount[l.target] || 0) + 1;
    });
    nodes.forEach((n) => {
      n.connections = connectionCount[n.id] || 0;
    });

    return NextResponse.json({
      nodes,
      links,
      stats: {
        gejala: gejalaList.length,
        penyakit: penyakitList.length,
        tanaman: tanamanList.length,
        kondisi: kondisiList.length,
        edges: links.length,
        totalNodes: nodes.length,
      },
    });
  } catch (error: any) {
    console.error("Graph Data API Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data graph.", details: error.message },
      { status: 500 }
    );
  }
}
