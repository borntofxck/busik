import { Terrain } from '../world/Terrain';
import { Roads } from '../world/Roads';
import { Fences } from '../world/Fences';
import { Cemetery } from '../world/Cemetery';
import { Props } from '../world/Props';
import { Buildings } from '../world/Buildings';
import { Trees } from '../world/Trees';
import { Player } from '../../entities/Player';
import { BusFleet } from '../../entities/BusFleet';
import { NpcCrowd } from '../../entities/NpcCrowd';
import { Supplies } from '../../entities/Supplies';
import { Lighting } from './Lighting';
import { Rain } from './Rain';
import { GameLoop } from '../../systems/GameLoop';

export function Scene() {
  return (
    <>
      <color attach="background" args={['#182220']} />
      <fogExp2 attach="fog" args={['#1c2622', 0.009]} />

      <Lighting />
      <Rain />

      {/* статичный мир */}
      <Terrain />
      <Roads />
      <Fences />
      <Cemetery />
      <Props />
      <Buildings />
      <Trees />

      {/* динамические сущности */}
      <Player />
      <BusFleet />
      <NpcCrowd />
      <Supplies />

      {/* мозг игры */}
      <GameLoop />
    </>
  );
}
