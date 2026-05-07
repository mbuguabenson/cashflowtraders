import React from 'react';
import classNames from 'classnames';
import Text from '../text/text';
import { BrandLogo } from '../../layout/app-logo/BrandLogo';

export type TLoadingProps = React.HTMLProps<HTMLDivElement> & {
    is_fullscreen: boolean;
    is_slow_loading: boolean;
    status: string[];
    theme: string;
};

const Loading = ({ className, id, is_fullscreen = true, is_slow_loading, status }: Partial<TLoadingProps>) => {
    return (
        <div
            data-testid='dt_initial_loader'
            className={classNames(
                'initial-loader',
                {
                    'initial-loader--fullscreen': is_fullscreen,
                },
                className
            )}
        >
            <div id={id} className='initial-loader__container'>
                <div className='initial-loader__logo-wrapper'>
                    <BrandLogo className='initial-loader__logo' width={180} height={50} />
                </div>
                <div className='initial-loader__progress-bar'>
                    <div className='initial-loader__progress-active' />
                </div>
                {is_slow_loading && (
                    <div className='initial-loader__status'>
                        {status?.map((text, inx) => (
                            <Text as='p' color='prominent' size='xs' align='center' key={inx} className='initial-loader__status-text'>
                                {text}
                            </Text>
                        ))}
                    </div>
                )}
            </div>
            <div className='initial-loader__background-blob' />
            <div className='initial-loader__background-blob initial-loader__background-blob--2' />
        </div>
    );
};

export default Loading;

