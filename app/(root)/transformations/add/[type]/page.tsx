import { redirect } from 'next/navigation';
import Header from '@/components/shared/Header';
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';

const AddTransformationTypePage = async (props: {
  params: { type: keyof typeof transformationTypes };
}) => {
  const { params } = props;
  const { type } =await params;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const transformation = transformationTypes[type];
  const user = await getUserById(userId);

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
