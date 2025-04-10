import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getAllImages } from "@/lib/actions/image.actions";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; query?: string };
}) {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = searchParams?.query || "";

  const images = await getAllImages({ page, searchQuery });

  return (
    <>
      <section className="home bg-banner px-4 py-10 sm:py-16">
        <h1 className="home-heading h1-semibold text-white text-center max-w-[500px] mx-auto">
          Unleash Your Creative Vision with Alter
        </h1>

        <ul className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-8">
          {navLinks.slice(1, 5).map((link) => (
            <li
              key={link.route}
              className="flex flex-col items-center gap-1 w-16 sm:w-20 md:w-24"
            >
              <Link
                href={link.route}
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className="flex items-center justify-center rounded-full bg-white p-4 shadow-md">
                  <Image
                    src={link.icon}
                    alt={link.label}
                    width={24}
                    height={24}
                  />
                </div>
                <p className="text-center text-white text-sm">{link.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPage}
          page={page}
        />
      </section>
    </>
  );
}
