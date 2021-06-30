import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface ImagesQueryResponse {
  after?: {
    id: string;
  };
  data: {
    title: string;
    description: string;
    url: string;
    ts: number;
    id: string;
  }[];
}

const getImages = async ({
  pageParam = null,
}): Promise<ImagesQueryResponse> => {
  const { data } = await api.get<ImagesQueryResponse>('/api/images', {
    params: {
      after: pageParam,
    },
  });

  return data;
};

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImages, {
    getNextPageParam: lastPage => {
      return lastPage.after ?? null;
    },
  });

  const formattedData = useMemo(() => {
    return data?.pages
      .map(page => {
        return page.data.map(image => {
          return {
            title: image.title,
            description: image.description,
            url: image.url,
            ts: image.ts,
            id: image.id,
          };
        });
      })
      .flat();
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />
      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button
            mt={10}
            onClick={() => {
              fetchNextPage();
            }}
          >
            {!isFetchingNextPage ? 'Carregar mais' : 'Carregando...'}
          </Button>
        )}
      </Box>
    </>
  );
}
