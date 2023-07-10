import {client} from "@/lib/data";
import Layout from "@/components/Layout";
import Archive from "@/components/Archive";

export const getStaticPaths = async () => {
	const tools = await client.fetch(`*[_type=='tool']{slug{current}}`);
	const paths = tools.map(tool => {
		return {
			params: {
				slug: tool?.slug.current
			}
		}
	})
	return {
		paths, fallback: true, // false or "blocking"
	}
}

export const getStaticProps = async (ctx) => {
	const tool = await client.fetch(`*[_type=='tool' && slug.current=='${ctx.params.slug}'][0]{title,slug{current},displayName}`);
	// @todo exclude stray tools
	const allTools = await client.fetch(`*[_type=='tool' && !(_id in path("drafts.**"))]{_id, title, slug, displayName}`);
	const portfolioItems = await client.fetch(`
		*[!(_id in path("drafts.**")) && count((tools[]->slug.current)[@ in ["${ctx.params.slug}"]]) > 0]|order(publishedDate desc){
			_id, title, slug, description, url,
			'featuredImage': featuredImage.asset->url, 
			category[]->{_id, title, slug, displayName}, 
			tools[]->{_id, title, slug, displayName}
		}
	`)
	return {
		props: {
			tool,
			allTools,
			portfolioItems
		}
	}
}

const Tool = ({tool, allTools, portfolioItems}) => {
	if (!tool || !portfolioItems) return null;
	const {title, displayName} = tool;
	return (
		<Layout>
			<Archive
				slug={tool.slug.current}
				type={'Tool'}
				path={'tool'}
				title={displayName ?? title}
				tags={allTools}
				items={portfolioItems}
			/>
		</Layout>
	);
};

export default Tool;