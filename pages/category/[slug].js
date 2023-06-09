import {client} from "@/lib/data";
import Layout from "@/components/Layout";
import Archive from "@/components/Archive";
import Head from "next/head";

export const getStaticPaths = async () => {
	const categories = await client.fetch(`*[_type=='category']{slug{current}}`);
	const paths = categories.map(category => {
		return {
			params: {
				slug: category?.slug.current
			}
		}
	})
	return {
		paths, fallback: true, // false or "blocking"
	}
}

export const getStaticProps = async (ctx) => {
	const category = await client.fetch(`*[_type=='category' && slug.current=='${ctx.params.slug}'][0]{title,slug{current},displayName}`);
	const allCategories = await client.fetch(`*[_type=='category' && !(_id in path("drafts.**"))]{_id, title, slug, displayName}`);
	const portfolioItems = await client.fetch(`
		*[!(_id in path("drafts.**")) && count((category[]->slug.current)[@ in ["${ctx.params.slug}"]]) > 0]|order(publishedDate desc){
			_id, title, slug, description, url,
			'featuredImage': featuredImage.asset->url, 
			category[]->{_id, title, slug, displayName}, 
			tools[]->{_id, title, slug, displayName}
		}
	`)
	return {
		props: {
			category,
			allCategories,
			portfolioItems
		}
	}
}

const Category = ({category, allCategories, portfolioItems}) => {
	if (!category || !portfolioItems) return null;
	const {title, displayName} = category;
	const workingTitle = displayName ?? title;
	return (
		<>
			<Head>
				<title>{workingTitle} Category | TP</title>
				<meta name="description" content={`This is a page listing projects within the ${workingTitle} category.`}/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				{/*<link rel="icon" href="/favicon.ico"/>*/}
			</Head>
			<Layout>
				<Archive
					slug={category.slug.current}
					type={'Category'}
					path={'category'}
					title={workingTitle}
					tags={allCategories}
					items={portfolioItems}
				/>
			</Layout>
		</>
	);
};

export default Category;