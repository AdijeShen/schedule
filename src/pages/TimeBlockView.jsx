import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Tooltip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getTimeBlocksByDate, updateTimeBlocks, updateTimeBlockNote, getAllTimeBlockStats } from '../services/timeBlockService';

const BLOCKS_PER_HOUR = 4; // 15分钟一个时间块
const HOURS_PER_DAY = 24;
const TOTAL_BLOCKS = BLOCKS_PER_HOUR * HOURS_PER_DAY;

const BLOCK_COLORS = {
    0: '#ff4d4f', // 红色
    1: '#faad14', // 黄色
    2: '#52c41a', // 绿色
};

function TimeBlockView() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [timeBlocks, setTimeBlocks] = useState(Array(TOTAL_BLOCKS).fill({ status: null, note: '' }));
    const [currentColor, setCurrentColor] = useState(0);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [colorStats, setColorStats] = useState({});
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadTimeBlocks();
        loadColorStats();
    }, [selectedDate]);

    const loadColorStats = async () => {
        const stats = await getAllTimeBlockStats();
        setColorStats(stats);
    };

    const loadTimeBlocks = async () => {
        const blocks = await getTimeBlocksByDate(selectedDate);
        setTimeBlocks(blocks.length ? blocks : Array(TOTAL_BLOCKS).fill({ status: null, note: '' }));
    };

    const handleContextMenu = (event, index) => {
        event.preventDefault();  // 阻止浏览器默认右键菜单
        event.stopPropagation(); // 阻止事件冒泡，避免触发 onClick
        setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
        setSelectedBlock(index);
        setCurrentNote(timeBlocks[index].note || '');
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenNoteDialog = () => {
        setNoteDialogOpen(true);
        handleCloseContextMenu();
    };

    const handleCloseNoteDialog = () => {
        setNoteDialogOpen(false);
        setSelectedBlock(null);
    };

    const handleSaveNote = async () => {
        if (selectedBlock !== null) {
            await updateTimeBlockNote(selectedDate, selectedBlock, currentNote);
            await loadTimeBlocks();
            handleCloseNoteDialog();
        }
    };

    const handleBlockClick = (index) => {
        setTimeBlocks(prevBlocks => {
            const newBlocks = [...prevBlocks];
            const currentBlock = newBlocks[index];
            // 状态循环：null → 0 → 1 → 2 → null
            const newStatus = currentBlock.status === null ? 0 : (currentBlock.status + 1) % 4 === 3 ? null : currentBlock.status + 1;
            newBlocks[index] = { ...currentBlock, status: newStatus };
            // 将日志放在 newStatus 定义之后
            console.log('当前状态:', currentBlock.status);
            console.log('新状态:', newStatus);
            return newBlocks;
        });
    };

    useEffect(() => {
        const saveTimeBlocks = async () => {
            await updateTimeBlocks(selectedDate, timeBlocks);
        };
        saveTimeBlocks();
    }, [timeBlocks, selectedDate]);

    const formatTime = (blockIndex) => {
        const hour = Math.floor(blockIndex / BLOCKS_PER_HOUR);
        const minute = (blockIndex % BLOCKS_PER_HOUR) * 15;
        const nextHour = Math.floor((minute + 15) / 60) + hour;
        const nextMinute = (minute + 15) % 60;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}-${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
    };

    const handleMouseDown = (index) => {
        setIsDragging(true);
        handleBlockClick(index);
    };

    const handleMouseEnter = async (index) => {
        if (isDragging) {
            setTimeBlocks(prevBlocks => {
                const newBlocks = [...prevBlocks];
                const currentBlock = newBlocks[index];
                const newStatus = currentColor;
                newBlocks[index] = { ...currentBlock, status: newStatus };
                return newBlocks;
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                时间块视图
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Paper sx={{ p: 2, flex: 1 }}>
                    <div style={{ width: '100%', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <IconButton onClick={() => setSelectedDate(selectedDate.subtract(1, 'month'))}>
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography variant="h6">
                                {selectedDate.format('YYYY年MM月')}
                            </Typography>
                            <IconButton onClick={() => setSelectedDate(selectedDate.add(1, 'month'))}>
                                <ChevronRightIcon />
                            </IconButton>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                <div key={day} style={{ fontWeight: 'bold', padding: '0.5rem' }}>{day}</div>
                            ))}
                            {(() => {
                                const firstDay = selectedDate.startOf('month');
                                const lastDay = selectedDate.endOf('month');
                                const days = [];
                                
                                // 填充月初空白日期
                                for (let i = 0; i < firstDay.day(); i++) {
                                    days.push(<div key={`empty-start-${i}`} />);
                                }
                                
                                // 填充当月日期
                                for (let i = 1; i <= lastDay.date(); i++) {
                                    const currentDate = selectedDate.set('date', i);
                                    const dateStr = currentDate.format('YYYY-MM-DD');
                                    const color = colorStats[dateStr] !== undefined ? BLOCK_COLORS[colorStats[dateStr]] : undefined;
                                    
                                    days.push(
                                        <div
                                            key={i}
                                            onClick={() => setSelectedDate(currentDate)}
                                            style={{
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                backgroundColor: color ? `${color}44` : undefined,
                                                borderRadius: '50%',
                                                width: '2em',
                                                height: '2em',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: 'auto',
                                                ...(currentDate.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD') ? {
                                                    border: '2px solid #1976d2'
                                                } : {})
                                            }}
                                        >
                                            {i}
                                        </div>
                                    );
                                }
                                
                                return days;
                            })()}
                        </div>
                    </div>
                </Paper>
                <Paper sx={{ p: 2, flex: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {selectedDate.format('YYYY年MM月DD日')}的时间块
                    </Typography>
                    <Grid container spacing={0.5}>
                        {timeBlocks.map((block, index) => (
                            <Grid item xs={1} key={index}>
                                <Tooltip title={block.note ? `${formatTime(index)} [${block.note}]` : formatTime(index)}>
                                    <Paper
                                        sx={{
                                            height: 20,
                                            backgroundColor: block.status === null ? '#f0f0f0' : BLOCK_COLORS[block.status],
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 },
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                        onClick={() => handleBlockClick(index)}
                                        onMouseDown={() => handleMouseDown(index)}
                                        onMouseEnter={() => handleMouseEnter(index)}
                                        onContextMenu={(e) => handleContextMenu(e, index)}
                                    />
                                </Tooltip>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            点击切换状态：灰色 → 红色 → 黄色 → 绿色
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleOpenNoteDialog}>添加/编辑备注</MenuItem>
            </Menu>

            <Dialog open={noteDialogOpen} onClose={handleCloseNoteDialog}>
                <DialogTitle>时间块备注 ({formatTime(selectedBlock || 0)})</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="备注内容"
                        fullWidth
                        multiline
                        rows={4}
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNoteDialog}>取消</Button>
                    <Button onClick={handleSaveNote} variant="contained">保存</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default TimeBlockView;