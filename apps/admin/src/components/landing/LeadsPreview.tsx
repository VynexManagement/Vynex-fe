import { Section } from "../ui/Section";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { Button } from "../ui/Button";
import Link from "next/link";
import { SectionHeader } from "../ui/SectionHeader";

export function LeadsPreview({ leads }: any) {

  const columns = [
    { header: "Store", accessor: "name" },

    {
      header: "URL",
      accessor: "url",
      render: (row: any) => (
        <span className="text-[#00adb5] font-mono text-xs">
          {row.url}
        </span>
      ),
    },

    {
      header: "Niche",
      accessor: "niche",
      render: (row: any) => (
        <span className="text-[#eeeeee]/70 text-xs">
          {row.niche}
        </span>
      ),
    },

    {
      header: "Country",
      accessor: "country",
      render: (row: any) => (
        <span className="text-[#eeeeee]/60 text-xs">
          {row.country}
        </span>
      ),
    },

    {
      header: "Signal",
      accessor: "signal",
      render: (row: any) => (
        <span className="bg-[#ffd6ba]/15 text-[#ffd6ba] px-2 py-1 rounded-full text-xs whitespace-nowrap">
          {row.signal}
        </span>
      ),
    },
  ];

  // ensure exactly 10 rows (safe fallback)
  const previewData = leads?.slice(0, 10) || [];

  return (
    <Section className="pb-24">

      {/* HEADER */}
      <SectionHeader
        title="Live Lead Preview"
        subtitle="Shopify stores filtered by niche, country & signal"
      />

      {/* TABLE */}
      <Card className="overflow-hidden">
        <Table columns={columns} data={previewData} />
      </Card>

      {/* CTA BELOW TABLE */}
      <div className="mt-8 text-center">
        {/* <Link href="/query">
          <Button className="px-8 py-3">
            Get Full Lead List
          </Button>
        </Link> */}

        <h3 className="text-[#eeeeee] mt-3">
          Unlock hundreds of verified leads instantly
        </h3>
      </div>

    </Section>
  );
}