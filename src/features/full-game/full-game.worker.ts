import { sharedData } from '../../data/dataset';
import { gameLoadMessage, loadGame } from '../../data/game-loader';
import { getStageAvailability } from '../../domain/availability';
import { fullGameStages } from '../../domain/availability/full-game-stages';

self.onmessage = async (event: MessageEvent<{ gameId: string; respectLevelLimit: boolean }>) => {
  try {
    const { gameId, respectLevelLimit } = event.data;
    const loaded = await loadGame(gameId);
    if (!loaded.ok) { self.postMessage({ error: gameLoadMessage(loaded.error) }); return; }
    const data = { ...sharedData, games: [loaded.value] };
    for (const stage of fullGameStages(loaded.value)) {
      const result = getStageAvailability(data, { gameId, milestoneId: stage.milestoneId, respectLevelLimit });
      if (!result.ok) { self.postMessage({ error: JSON.stringify(result.error) }); return; }
      self.postMessage({ stageId: stage.id, snapshot: result.value });
    }
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
